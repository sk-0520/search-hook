import * as shared from "../share/common";
import * as conf from "../conf";

const outputContent = new shared.Logger('Content');

export class HiddenCheker {
    item?: conf.HiddenItemSetting;
    match?: (s: string) => boolean;
}

export function getCheckers(hideItems: Array<conf.HiddenItemSetting>) {
    return hideItems.map(function (i) {
        const obj = new HiddenCheker();
        obj.item =  i;
        
        switch (i.match.kind) {
            case 'partial':
                if (i.match.case) {
                    const word = i.word.toUpperCase();
                    obj.match = function (s) {
                        return s.toUpperCase().indexOf(word) !== -1;
                    }
                } else {
                    obj.match = function (s) {
                        return s.indexOf(i.word) !== -1;
                    }
                }
                break;

            case 'forward':
                if (i.match.case) {
                    const word = i.word.toUpperCase();
                    obj.match = function (s) {
                        return s.toUpperCase().indexOf(word) === 0;
                    }
                } else {
                    obj.match = function (s) {
                        return s.indexOf(i.word) === 0;
                    }
                }
                break;

            case 'perfect':
                if (i.match.case) {
                    const word = i.word.toUpperCase();
                    obj.match = function (s) {
                        return s.toUpperCase() === word;
                    }
                } else {
                    obj.match = function (s) {
                        return s === i.word
                    }
                }
                break;

            case 'regex':
                const reg = i.match.case ? new RegExp(i.word) : new RegExp(i.word, 'i');
                obj.match = function (s) {
                    return reg.test(s);
                }
                break;

            default:
                outputContent.error(`kind: ${JSON.stringify(i)}`)
        }

        return obj;
    })
}

export function matchUrl(linkValue:string, checkers: Array<HiddenCheker>) {

    var url = function() {
        try {
            return new URL(linkValue);
        } catch(ex) {
            outputContent.error(ex);
            return false;
        }
    }();

    if(!url) {
        return false;
    }

    // プロトコル、ポート、パスワード云々は無視
    var urlValue = url.hostname;
    if (url.pathname && url.pathname.length) {
        urlValue += url.pathname;
    }
    if (url.search && url.search.length) {
        urlValue += url.search;
    }

    return checkers.some(function(i) {
        return i.match!(urlValue);
    });
}

export function matchSimleUrl(linkValue:string, checkers: Array<HiddenCheker>) {
    return matchUrl(linkValue, checkers);
}

export function matchQueryUrl(linkValue:string, checkers: Array<HiddenCheker>) {
    try {
        var index = linkValue.indexOf('?');
        if(index !== -1) {
            var params = new URLSearchParams(linkValue.substr(index + 1));
            outputContent.debug('params: ' + params);

            if(params.has('q')) {
                var query = params.get('q')!;
                outputContent.debug('q: ' + query);

                return matchUrl(query, checkers);
            }
        }
    } catch(ex) {
        outputContent.error(ex);
    }

    return false;
}

export function hideElement(element: Element) {
    element.classList.add('WE___search-hook-_-_-hidden');
    element.classList.add('WE___search-hook-_-_-hidden-item');
}

export function switchHideItems() {
    var items = document.querySelectorAll('.WE___search-hook-_-_-hidden');
    if(!items.length) {
        return;
    }
    
    for(var i = 0; i < items.length; i++) {
        var item = items[i];
        item.classList.toggle('WE___search-hook-_-_-hidden-item');
    }
}

export function appendHiddenSwitch() {
    var switchElement = document.createElement('input');
    switchElement.setAttribute('type', 'checkbox');
    switchElement.checked = true;
    switchElement.addEventListener('change', function(e) {
        switchHideItems();
    });

    var groupElement = document.createElement('label');
    groupElement.appendChild(switchElement);
    groupElement.appendChild(document.createTextNode('hide items'));

    var parent = document.createElement('div');
    parent.appendChild(groupElement);
    parent.classList.add('WE___search-hook-_-_-switch');

    document.getElementsByTagName('body')[0].appendChild(parent);
}