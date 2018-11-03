import { isNullOrEmpty, LoggingBase, Exception } from "../share/common";
import { MatchKind } from "../share/define/match-kind";
import { HideItemSetting, IHideItemSetting } from "../share/setting/hide-item-setting";
import { IServiceEnabledSetting } from "../share/setting/service-enabled-setting";
import { IDeliveryHideHeaderSetting } from "../share/setting/delivery-hide-setting";

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
        // 大文字小文字は未指定なら区別しない扱い
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

    public getAsync(url: string): Promise<string | null> {
        return fetch(url, {
            cache: 'no-cache',
            redirect: 'follow',
        }).then(
            result => {
                if (result.ok) {
                    return result.text();
                } else {
                    throw new Exception(result);
                }
            }
        ).then(
            result => {
                return result;
            }
        ).catch(ex => {
            this.logger.dumpError(ex);
            return null;
        });
    }

    public split(content: string): IDeliveryHideItemData {
        const lines = content.split(/\r?\n/).map((s, i) => {
            return { line: s, index: i };
        });

        function createLineOnlyData(): IDeliveryHideItemData {
            return {
                header: {
                    url: '',
                    name: '',
                    author: '',
                    version: '',
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

        // 長さ会わないし調べるのも面倒
        if (maybeHeaders.length !== headerSeparator.index) {
            return createLineOnlyData();
        }

        const obj = {
            name: '',
            version: '',
            author: '',
        };

        const regex = /\#\s*((?:name)|(?:version)|(?:author))\s*:\s*(.*)/;
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
            },
            lines: lines.slice(headerSeparator.index + 1).map(l => l.line.trim()),
        };

    }
}

