'use strict'

const outputBing = createLogger('Bing Content');

const port = browser.runtime.connect();
port.onMessage.addListener(function(message) {
    outputBing.debug("CLIENT RECV!");
    outputBing.debug(JSON.stringify(message));

    switch(message.kind) {
        case 'items':
            if(!message.data.enabled) {
                outputBing.debug("ignore bing content");
                return;
            }
        
            var hideItems = message.data.items;
            hideBingItems(hideItems);
            break;
            
        case 'erase': 
            if(!message.data.enabled) {
                outputBing.debug("ignore bing content");
                return;
            }

            var items = message.data.items;
            eraseBingQuery(items);
            break;

        default:
            throw { error: message};

    }
});
port.postMessage({service: ServiceKind_Bing});

function hideBingItems(hideItems) {
    if(!hideItems || !hideItems.length) {
        outputBing.debug('empty hide items');
        return;
    }

    var checkers = getCheckers(hideItems);

    var elementSelector = {
        element: '.b_algo',
        link: 'a'
    };

    var elements = document.querySelectorAll(elementSelector.element);
    for(var i = 0; i < elements.length; i++) {
        var element = elements[i];
        var linkElement = element.querySelector(elementSelector.link);

        var link = linkElement.getAttribute('href');
        outputBing.debug('link: ' + link);

        // 普通パターン
        if(matchSimleUrl(link, checkers)) {
            hideElement(element);
            continue;
        }

        // /path?q=XXX 形式
        if(matchQueryUrl(link, checkers)) {
            hideElement(element);
            continue;
        }

        outputBing.debug('show: ' + link);
    }

    appendHiddenSwitch();
}

function eraseBingQuery(items) {
    outputBing.debug('aaaaaa');

    var queryElement = document.querySelector('input[name="q"]');
    var queryValue = queryElement.value;
    outputBing.debug('q: ' + queryValue);

    var currentQuery = splitQuery(ServiceKind_Bing, queryValue);
    var userInputQuery = getUserInputQuery(ServiceKind_Bing, currentQuery, items);
    outputBing.debug('u: ' + userInputQuery);

    queryElement.value = userInputQuery + ' ';
}