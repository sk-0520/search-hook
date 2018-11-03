import { isNullOrEmpty, LoggingBase } from "../share/common";
import { MatchKind } from "../share/define/match-kind";
import { HideItemSetting, IHideItemSetting } from "../share/setting/hide-item-setting";
import { IServiceEnabledSetting } from "../share/setting/service-enabled-setting";

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
