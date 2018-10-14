'use strict'

const outputBing = createLogger('Bing Content');

const port = browser.runtime.connect();
port.onMessage.addListener(function(message) {
    port.disconnect();
    
    outputBing.debug("CLIENT RECV!");
    outputBing.debug(JSON.stringify(message));

    var hideItems = message.items;

    hideGoogleItems(hideItems);
});
port.postMessage({service: ServiceKind_Bing});

function hideGoogleItems(hideItems) {
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
            element.classList.add('WE___hook-search-_-_-hidden');
            element.classList.add('WE___hook-search-_-_-hidden-item');
        } else {
            outputBing.debug('view');
        }
    
    }
}

