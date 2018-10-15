'use strict'

const outputContent = createLogger('Content');

function getCheckers(hideItems) {
    return hideItems.map(function (i) {
        const obj = {
            item: i,
            match: null
        };
        
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
                outputBackground.error(`kind: ${JSON.stringify(i)}`)
        }

        return obj;
    })
}

function matchUrl(linkValue, checkers) {

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
        return i.match(urlValue);
    });
}

function hideElement(element) {
    element.classList.add('WE___search-hook-_-_-hidden');
    element.classList.add('WE___search-hook-_-_-hidden-item');
}

function switchHideItems() {
    var items = document.querySelectorAll('.WE___search-hook-_-_-hidden');
    if(!items.length) {
        return;
    }
    
    for(var i = 0; i < items.length; i++) {
        var item = items[i];
        item.classList.toggle('WE___search-hook-_-_-hidden-item');
    }
}