import * as shared from "../share/common";
import { HideItemSetting, IReadOnlyHideItemSetting } from "../share/setting/hide-item-setting";
import { ElementClass, toSelector } from "../share/define/element-names";

const outputContent = new shared.Logger('Content');

export interface IHideCheker {
    item: HideItemSetting;
    match: (s: string) => boolean;
}

export function getCheckers(hideItems: ReadonlyArray<IReadOnlyHideItemSetting>): Array<IHideCheker> {
    return hideItems.map(i => {
        let func: (s: string) => boolean;

        switch (i.match.kind) {
            case 'partial':
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

            case 'forward':
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

            case 'perfect':
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

            case 'regex':
                const reg = i.match.case ? new RegExp(i.word) : new RegExp(i.word, 'i');
                func = s => {
                    return reg.test(s);
                };
                break;

            default:
                throw { error: i };
        }

        return {
            item: i,
            match: func,
        };
    });
}

function matchUrl(linkValue: string, checkers: ReadonlyArray<IHideCheker>): boolean {

    let url: URL;
    try {
        url = new URL(linkValue);
    } catch (ex) {
        outputContent.error(ex);
        return false;
    }

    // プロトコル、ポート、パスワード云々は無視
    let urlValue = url.hostname;
    if (url.pathname && url.pathname.length) {
        urlValue += url.pathname;
    }
    if (url.search && url.search.length) {
        urlValue += url.search;
    }

    return checkers.some(i => i.match(urlValue));
}

export function matchSimpleUrl(linkValue: string, checkers: ReadonlyArray<IHideCheker>): boolean {
    return matchUrl(linkValue, checkers);
}

export function matchQueryUrl(linkValue: string, checkers: ReadonlyArray<IHideCheker>): boolean {
    try {
        const index = linkValue.indexOf('?');
        if (index !== -1) {
            const params = new URLSearchParams(linkValue.substr(index + 1));
            outputContent.debug('params: ' + params);

            if (params.has('q')) {
                const query = params.get('q')!;
                outputContent.debug('q: ' + query);

                return matchUrl(query, checkers);
            }
        }
    } catch (ex) {
        outputContent.error(ex);
    }

    return false;
}

export function hideElement(element: Element) {
    element.classList.add(ElementClass.hidden);
    element.classList.add(ElementClass.hiddenItem);
}

export function switchHideItems() {
    const items = document.querySelectorAll(toSelector(ElementClass.hidden));
    if (!items.length) {
        return;
    }

    for (const item of items) {
        item.classList.toggle(ElementClass.hiddenItem);
    }
}

export function appendHiddenSwitch() {

    const switchElement = document.createElement('input');
    switchElement.setAttribute('type', 'checkbox');
    switchElement.checked = true;
    switchElement.addEventListener('change', e => {
        switchHideItems();
    });

    const groupElement = document.createElement('label');
    groupElement.appendChild(switchElement);
    groupElement.appendChild(document.createTextNode('hide items'));

    const parent = document.createElement('div');
    parent.appendChild(groupElement);
    parent.classList.add(ElementClass.switch);

    document.getElementsByTagName('body')[0].appendChild(parent);
}
