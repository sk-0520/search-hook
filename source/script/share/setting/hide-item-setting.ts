import { IReadOnlyMatchSetting, IMatchSetting, MatchSetting } from "./match-setting";
import { IReadOnlyServiceEnabledSetting, IServiceEnabledSetting, ServiceEnabledSetting } from "./service-enabled-setting";

export interface IReadOnlyHideItemSetting {
    readonly word: string;
    readonly match: IReadOnlyMatchSetting;
    readonly service: IReadOnlyServiceEnabledSetting;
}

export interface IHideItemSetting extends IReadOnlyHideItemSetting {
    word: string;
    match: IMatchSetting;
    service: IServiceEnabledSetting;
}

export class HideItemSetting implements IHideItemSetting {
    public word = '';
    public match = new MatchSetting();
    public service = new ServiceEnabledSetting();
}