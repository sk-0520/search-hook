import * as conf from "../conf";
import * as shared from "../share/common";

const outputContent = new shared.Logger('Content');

export class HiddenCheker {
    public item?: conf.HiddenItemSetting;
    public match?: (s: string) => boolean;
}

export function getCheckers(hideItems: Array<conf.HiddenItemSetting>) {
    return hideItems.map(i => {
        const obj = new HiddenCheker();
        obj.item = i;

        switch (i.match.kind) {
            case 'partial':
                if (i.match.case) {
                    const word = i.word.toUpperCase();
                    obj.match = s => {
                        return s.toUpperCase().indexOf(word) !== -1;
                    };
                } else {
                    obj.match = s => {
                        return s.indexOf(i.word) !== -1;
                    };
                }
                break;

            case 'forward':
                if (i.match.case) {
                    const word = i.word.toUpperCase();
                    obj.match = s => {
                        return s.toUpperCase().indexOf(word) === 0;
                    };
                } else {
                    obj.match = s => {
                        return s.indexOf(i.word) === 0;
                    };
                }
                break;

            case 'perfect':
                if (i.match.case) {
                    const word = i.word.toUpperCase();
                    obj.match = s => {
                        return s.toUpperCase() === word;
                    };
                } else {
                    obj.match = s => {
                        return s === i.word;
                    };
                }
                break;

            case 'regex':
                const reg = i.match.case ? new RegExp(i.word) : new RegExp(i.word, 'i');
                obj.match = s => {
                    return reg.test(s);
                };
                break;

            default:
                outputContent.error(`kind: ${JSON.stringify(i)}`);
        }

        return obj;
    });
}

export function matchUrl(linkValue: string, checkers: Array<HiddenCheker>) {

    let url = null;
    try {
        url = new URL(linkValue);
    } catch (ex) {
        outputContent.error(ex);
    }

    if (!url) {
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

    return checkers.some(i => {
        return i.match!(urlValue);
    });
}

export function matchSimleUrl(linkValue: string, checkers: Array<HiddenCheker>) {
    return matchUrl(linkValue, checkers);
}

export function matchQueryUrl(linkValue: string, checkers: Array<HiddenCheker>) {
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
    element.classList.add('WE___search-hook-_-_-hidden');
    element.classList.add('WE___search-hook-_-_-hidden-item');
}

export function switchHideItems() {
    const items = document.querySelectorAll('.WE___search-hook-_-_-hidden');
    if (!items.length) {
        return;
    }

    for (const item of items) {
        item.classList.toggle('WE___search-hook-_-_-hidden-item');
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
    parent.classList.add('WE___search-hook-_-_-switch');

    document.getElementsByTagName('body')[0].appendChild(parent);
}
