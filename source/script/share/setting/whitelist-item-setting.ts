import { IMatchSetting, IReadOnlyMatchSetting, MatchSetting } from "./match-setting";
import { IReadOnlyServiceEnabledSetting, IServiceEnabledSetting, ServiceEnabledSetting } from "./service-enabled-setting";
import { IReadOnlyWordMatchItemSetting, IWordMatchItemSetting, WordMatchItemSetting } from "./word-match-item-setting";

export interface IReadOnlyWhitelistItemSetting extends IReadOnlyWordMatchItemSetting {
    readonly word: string;
    readonly match: IReadOnlyMatchSetting;
    readonly service: IReadOnlyServiceEnabledSetting;
}

export interface IWhitelistItemSetting extends IReadOnlyWhitelistItemSetting, IWordMatchItemSetting {
    word: string;
    match: IMatchSetting;
    service: IServiceEnabledSetting;
}

export class WhitelistItemSetting extends WordMatchItemSetting implements IWhitelistItemSetting {
    public word = '';
    public match = new MatchSetting();
    public service = new ServiceEnabledSetting();
}
