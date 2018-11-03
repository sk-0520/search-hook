import { IHideItemSetting, IReadOnlyHideItemSetting } from "../share/setting/hide-item-setting";
import { LoggingBase, Exception } from "../share/common";
import { MatchKind } from "../share/define/match-kind";

export interface IHideCheker {
    item: IHideItemSetting;
    match: (s: string) => boolean;
}

export class HideItemStocker extends LoggingBase {
    private hideItemGroup = new Map<string, Array<IReadOnlyHideItemSetting>>();
    private hideCheckerGroup = new Map<string, Array<IHideCheker>>();

    public get hideItems(): ReadonlyMap<string, ReadonlyArray<IReadOnlyHideItemSetting>> {
        return this.hideItemGroup;
    }
    public get hideCheckers(): ReadonlyMap<string, ReadonlyArray<IHideCheker>> {
        return this.hideCheckerGroup;
    }

    constructor() {
        super('HideStocker');
    }

    private getCheckers(hideItems: ReadonlyArray<IReadOnlyHideItemSetting>): Array<IHideCheker> {
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
            } as IHideCheker;
        });
    }
    
    public import(key: string, items: Array<IReadOnlyHideItemSetting>) {
        this.hideItemGroup.set(key, items);
        const chekers = this.getCheckers(items);
        this.hideCheckerGroup.set(key, chekers);
    }

}

