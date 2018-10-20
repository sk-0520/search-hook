'use strict'

const outputGoogle = createLogger('Google Content');

const port = browser.runtime.connect();
port.onMessage.addListener(function(message) {
    outputGoogle.debug("CLIENT RECV!");
    outputGoogle.debug(JSON.stringify(message));

    switch(message.kind) {
        case 'items':
            if(!message.data.enabled) {
                outputGoogle.debug("ignore google content");
                return;
            }
        
            var hideItems = message.data.items;
            hideGoogleItems(hideItems);
            break;

        case 'erase': 
            if(!message.data.enabled) {
                outputGoogle.debug("ignore google content");
                return;
            }

            var items = message.data.items;
            eraseGoogleQuery(items);
            break;

        default:
            throw { error: message};
    }

});
port.postMessage({service: ServiceKind_Google});

function hideGoogleItems(hideItems) {
    if(!hideItems || !hideItems.length) {
        outputGoogle.debug('empty hide items');
        return;
    }

    var checkers = getCheckers(hideItems);

    var elementSelectors = [
        {
            target: 'smart',
            element: '#main > div',
            link: 'a[href^="/url?q="]'
        },
        { 
            target: 'touch',
            element: '.srg > div',
            link: 'a[ping]'
        },
        {
            target: 'universal',
            element: '#universal > div',
            link: 'a'
        },
        { 
            target: 'default',
            element: '.g',
            link: 'a'
        }
    ];

    var success = false;
    for(var i = 0; i < elementSelectors.length; i++) {
        var elementSelector = elementSelectors[i];
        
        outputGoogle.debug('target: ' + elementSelector.target);

        var elements = document.querySelectorAll(elementSelector.element);
        outputGoogle.debug('elements: ' + elements.length);


        for(var j = 0; j < elements.length; j++) {
            var element = elements[j];

            var linkElement = element.querySelector(elementSelector.link);
            if(!linkElement) {
                continue;
            }
    
            var link = linkElement.getAttribute('href');
            outputGoogle.debug('link: ' + link);
    
            // 普通パターン
            if(matchSimleUrl(link, checkers)) {
                hideElement(element);
                success = true;
                continue;
            }
    
            // /path?q=XXX 形式
            if(matchQueryUrl(link, checkers)) {
                hideElement(element);
                success = true;
                continue;
            }
    
            outputGoogle.debug('show: ' + link);
        }

        if(success) {
            break;
        }
    }

    if(success) {
        appendHiddenSwitch();
    }
}

function eraseGoogleQuery(items) {
    var queryElement = document.querySelector('input[name="q"]');
    var queryValue = queryElement.value;
    outputGoogle.debug('q: ' + queryValue);

    var currentQuery = splitQuery(ServiceKind_Google, queryValue);
    var userInputQuery = getUserInputQuery(ServiceKind_Google, currentQuery, items);
    outputGoogle.debug('u: ' + userInputQuery);

    queryElement.value = userInputQuery.join(' ') + ' ';

    // サジェストが鬱陶しい問題
    var suggestElement = document.querySelector('.sbdd_a, .gssb_c');
    if(suggestElement) {
        outputGoogle.debug('has suggest');
        var observer = new MutationObserver(function(mutations) {
            if(!queryElement.activeElement) {
                if(suggestElement.style.display !== 'none') {
                    outputGoogle.debug('suggest disable');
                    suggestElement.style.display = 'none';
                }
            } else {
                outputGoogle.debug('suggest enable');
            }
            observer.disconnect();
        });
        var config = {
            attributes: true,
            childList: false,
            characterData: false
        };
        observer.observe(suggestElement, config);
    }
}
