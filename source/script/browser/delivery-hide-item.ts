import { isNullOrEmpty, LoggingBase, splitLines, merge } from "../share/common";
import { MatchKind } from "../share/define/match-kind";
import { HideItemSetting, IHideItemSetting } from "../share/setting/hide-item-setting";
import { IServiceEnabledSetting } from "../share/setting/service-enabled-setting";
import { IDeliveryHideHeaderSetting, DeliveryHideSetting, IDeliveryHideSetting } from "../share/setting/delivery-hide-setting";

export interface IDeliveryCheckResult {
    success: boolean;
    message: string;
}

export class DeliveryHideItemConverter extends LoggingBase {
    constructor() {
        super('DeliveryHideItemConverter');
    }

    private toMatchKind(s: string): MatchKind {
        switch (s) {
            case '*': return MatchKind.partial;
            case '^': return MatchKind.forward;
            case '=': return MatchKind.perfect;
            case '/': return MatchKind.regex;

            default:
                //this.logger.warn(`convert error: ${s}`);
                return MatchKind.partial;
        }
    }

    private toCaseSensitive(s: string): boolean {
        switch (s) {
            case 'N':
            case 'n':
                return false;

            case 'Y':
            case 'y':
                return true;

            default:
                //this.logger.warn(`convert error: ${s}`);
                return false;
        }
    }

    public convertItem(deliveryHideLine: string, enabledSetting: IServiceEnabledSetting): IHideItemSetting | null {
        if (isNullOrEmpty(deliveryHideLine)) {
            return null;
        }

        if (deliveryHideLine.charAt(0) === '#') {
            return null;
        }

        const mainIndex = deliveryHideLine.indexOf(':');
        if (mainIndex === -1) {
            //this.logger.warn(`not found ':', ${deliveryHideLine}`);
            return null;
        }
        const head = deliveryHideLine.substr(0, mainIndex);
        const body = deliveryHideLine.substr(mainIndex + 1);

        const setting: IHideItemSetting = new HideItemSetting();

        const headValues = head.split(',');
        setting.match.kind = this.toMatchKind(headValues[0].trim());
        // ?????????????????????????????????????????????????????????
        if (1 < headValues.length) {
            setting.match.case = this.toCaseSensitive(headValues[1].trim());
        } else {
            setting.match.case = false;
        }
        setting.word = body.trim();

        //merge(setting.service, enabledSetting);
        setting.service = enabledSetting;

        return setting;
    }

    public convertItems(deliveryHideLines: ReadonlyArray<string>, enabledSetting: IServiceEnabledSetting): Array<IHideItemSetting> {
        return deliveryHideLines.map(s => {
            return this.convertItem(s, enabledSetting);
        }).filter(i => {
            return i;
        }).map(i => {
            return i!;
        });
    }
}

export interface IDeliveryHideItemData {
    header: IDeliveryHideHeaderSetting;
    lines: Array<string>;
}

export class DeliveryHideItemGetter extends LoggingBase {

    constructor() {
        super('DeliveryHideItemGetter');
    }

    public async getAsync(url: string): Promise<string | null> {
        try {
            const response = await fetch(url, {
                cache: 'no-cache',
                redirect: 'follow',
            });
    
            if (response.ok) {
                return await response.text();
            }
        } catch(ex) {
            this.logger.dumpError(ex);
        }

        return null;
    }

    public split(content: string): IDeliveryHideItemData {
        const lines = splitLines(content).map((s, i) => {
            return { line: s, index: i };
        });

        function createLineOnlyData(): IDeliveryHideItemData {
            return {
                header: {
                    url: '',
                    name: '',
                    author: '',
                    version: '',
                    website: '',
                },
                lines: lines.map(l => l.line.trim()),
            };
        }

        const headerSeparators = lines.filter(i => i.line.startsWith('##'));
        if (!headerSeparators.length) {
            return createLineOnlyData();
        }

        const headerSeparator = headerSeparators[0];

        const maybeHeaders = lines
            .slice(0, headerSeparator.index)
            .filter(i => i.line.startsWith('#'))
            ;

        // ??????????????????????????????????????????
        if (maybeHeaders.length !== headerSeparator.index) {
            return createLineOnlyData();
        }

        const obj = {
            name: '',
            version: '',
            author: '',
            website: '',
        } as IDeliveryHideHeaderSetting;

        const regex = /\#\s*((?:name)|(?:version)|(?:author)|(?:website))\s*:\s*(.*)/;
        for (const maybeHeader of maybeHeaders) {
            const macth = regex.exec(maybeHeader.line);
            if (macth) {
                switch (macth[1]) {
                    case 'name':
                        obj.name = macth[2].trim();
                        break;

                    case 'version':
                        obj.version = macth[2].trim();
                        break;

                        case 'author':
                        obj.author = macth[2].trim();
                        break;

                        case 'website':
                        obj.website = macth[2].trim();
                        break;

                    default:
                        break;
                }
            }
        }

        return {
            header: {
                url: '',
                name: obj.name,
                author: obj.author,
                version: obj.version,
                website: obj.website,
            },
            lines: lines.slice(headerSeparator.index + 1).map(l => l.line.trim()),
        };
    }

    private createSuccess(): IDeliveryCheckResult {
        return { success: true, message: '' };
    }
    private createError(msg: string): IDeliveryCheckResult {
        return { success: false, message: msg };
    }

    public checkResult(result: string | null): IDeliveryCheckResult {
        if (isNullOrEmpty(result)) {
            return this.createError(browser.i18n.getMessage('deliveryHideItemErrorHttp'));
        }

        return this.createSuccess();
    }

    public checkData(data: IDeliveryHideItemData): IDeliveryCheckResult {
        if (isNullOrEmpty(data.header.name)) {
            return this.createError(browser.i18n.getMessage('deliveryHideItemErrorKeyEmpty', 'name' ));
        }

        if (isNullOrEmpty(data.header.version)) {
            return this.createError(browser.i18n.getMessage('deliveryHideItemErrorKeyEmpty', 'version' ));
        }

        if (!data.lines.length || data.lines.every(s => isNullOrEmpty(s))) {
            return this.createError(browser.i18n.getMessage('deliveryHideItemErrorDataEmpty', 'version' ));
        }

        return this.createSuccess();
    }

}

export interface IDeliveryHideItemResult {
    success: boolean;
    message?: string;
    content?: string;
    header?: IDeliveryHideHeaderSetting;
    lines?: Array<string>;
    setting?: IDeliveryHideSetting;
}

export async function getDeliveryHideItemAsync(url: string): Promise<IDeliveryHideItemResult> {
    const getter = new DeliveryHideItemGetter();
    const result = await getter.getAsync(url);

    const checkedResult = getter.checkResult(result);
    if (!checkedResult.success) {
        return {
            success: false,
            message: checkedResult.message,
            content: result,
        } as IDeliveryHideItemResult;
    }

    const data = getter.split(result!);
    // URL ?????????
    data.header.url = url;

    const checkedData = getter.checkData(data);
    if (!checkedData.success) {
        return {
            success: false,
            message: checkedData.message,
            content: result,
            header: data.header,
        } as IDeliveryHideItemResult;
    }

    // ??????
    const hideSetting = new DeliveryHideSetting();
    merge(hideSetting, data.header);
    hideSetting.service.google = true;
    hideSetting.service.bing = true;
    
    return {
        success: true,
        message: checkedResult.message,
        content: result,
        header: data.header,
        setting: hideSetting,
        lines: splitLines(result!),
    } as IDeliveryHideItemResult;
}
