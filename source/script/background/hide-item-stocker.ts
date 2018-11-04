import { IHideItemSetting, IReadOnlyHideItemSetting } from "../share/setting/hide-item-setting";
import { LoggingBase, Exception } from "../share/common";
import { MatchKind } from "../share/define/match-kind";

export interface IHideMatcher {
    item: IHideItemSetting;
    match: (s: string) => boolean;
}

export class HideItemStocker extends LoggingBase {
    public static readonly applicationKey = '';

    private hideItemGroup = new Map<string, ReadonlyArray<IReadOnlyHideItemSetting>>();
    private hideMatcherGroup = new Map<string, ReadonlyArray<IHideMatcher>>();

    public get hideItems(): ReadonlyMap<string, ReadonlyArray<IReadOnlyHideItemSetting>> {
        return this.hideItemGroup;
    }
    public get hideMatchers(): ReadonlyMap<string, ReadonlyArray<IHideMatcher>> {
        return this.hideMatcherGroup;
    }

    constructor() {
        super('HideStocker');

    }

    private getCheckers(hideItems: ReadonlyArray<IReadOnlyHideItemSetting>): Array<IHideMatcher> {
        return hideItems.map(i => {
            let func: (s: string) => boolean;

            switch (i.match.kind) {
                case MatchKind.partial:
                    if (i.match.case) {
                        const word = i.word.toUpperCase();
                        func = s => {
                            return s.toUpperCase().indexOf(word) !== -1;
                        };
                    } else {
                        func = s => {
                            return s.indexOf(i.word) !== -1;
                        };
                    }
                    break;

                case MatchKind.forward:
                    if (i.match.case) {
                        const word = i.word.toUpperCase();
                        func = s => {
                            return s.toUpperCase().indexOf(word) === 0;
                        };
                    } else {
                        func = s => {
                            return s.indexOf(i.word) === 0;
                        };
                    }
                    break;

                case MatchKind.perfect:
                    if (i.match.case) {
                        const word = i.word.toUpperCase();
                        func = s => {
                            return s.toUpperCase() === word;
                        };
                    } else {
                        func = s => {
                            return s === i.word;
                        };
                    }
                    break;

                case MatchKind.regex:
                    const reg = i.match.case ? new RegExp(i.word) : new RegExp(i.word, 'i');
                    func = s => {
                        return reg.test(s);
                    };
                    break;

                default:
                    throw new Exception(i);
            }

            return {
                item: i,
                match: func,
            } as IHideMatcher;
        });
    }
    
    public importHideItems(key: string, items: ReadonlyArray<IReadOnlyHideItemSetting>) {
        this.hideItemGroup.set(key, items);
        const chekers = this.getCheckers(items);
        this.hideMatcherGroup.set(key, chekers);
    }

}

