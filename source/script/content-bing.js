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

        case 'switch':
            outputBing.debug("switch");
            switchHideItems();
            break;
    }
});
port.postMessage({service: ServiceKind_Bing});

function hideBingItems(hideItems) {
    if(!hideItems || !hideItems.length) {
        outputBing.debug('empty hide items');
        return;
    }

    var checkers = getCheckers(hideItems);

    var elements = document.querySelectorAll('.b_algo');
    for(var i = 0; i < elements.length; i++) {
        var element = elements[i];
        var linkElement = element.querySelector('a');

        // めっちゃ嘘くさい。。。
        var link = linkElement.getAttribute('href');

        if(matchUrl(link, checkers)) {
            outputBing.debug('hide:' + link);
            element.classList.add('WE___search-hook-_-_-hidden');
            element.classList.add('WE___search-hook-_-_-hidden-item');
        } else {
            outputBing.debug('view');
        }
    }
}

