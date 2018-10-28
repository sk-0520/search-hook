import { MatchKind } from "../define/match-kind";

export interface IReadOnlyMatchSetting {
    readonly kind: MatchKind;
    /**
     * 大文字小文字を区別するか。
     */
    readonly case: boolean;
}

export interface IMatchSetting extends IReadOnlyMatchSetting {
    kind: MatchKind;
    case: boolean;
}

export class MatchSetting implements IMatchSetting {
    public kind = MatchKind.partial;
    public case = false;
}
