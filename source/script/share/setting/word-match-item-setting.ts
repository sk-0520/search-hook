import { IMatchSetting, IReadOnlyMatchSetting, MatchSetting } from "./match-setting";
import { IReadOnlyServiceEnabledSetting, IServiceEnabledSetting, ServiceEnabledSetting } from "./service-enabled-setting";

export interface IReadOnlyWordMatchItemSetting {
    readonly word: string;
    readonly match: IReadOnlyMatchSetting;
    readonly service: IReadOnlyServiceEnabledSetting;
}

export interface IWordMatchItemSetting extends IReadOnlyWordMatchItemSetting {
    word: string;
    match: IMatchSetting;
    service: IServiceEnabledSetting;
}

export class WordMatchItemSetting implements IWordMatchItemSetting {
    public word = '';
    public match = new MatchSetting();
    public service = new ServiceEnabledSetting();
}
