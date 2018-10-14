'use strict'

const outputGoogle = createLogger('Google Content');

const port = browser.runtime.connect();
port.onMessage.addListener(function(message) {
    port.disconnect();
    
    outputGoogle.debug("CLIENT RECV!");
    outputGoogle.debug(JSON.stringify(message));

    var hideItems = message.items;

    hideGoogleItems(hideItems);
});
port.postMessage({service: ServiceKind_Google});

function hideGoogleItems(hideItems) {
    if(!hideItems || !hideItems.length) {
        outputGoogle.debug('empty hide items');
        return;
    }

    var checkers = getCheckers(hideItems);

    var elements = document.querySelectorAll('.g');
    for(var i = 0; i < elements.length; i++) {
        var element = elements[i];
        var linkElement = element.querySelector('a');

        // めっちゃ嘘くさい。。。
        var link = linkElement.getAttribute('href');

        if(matchUrl(link, checkers)) {
            outputGoogle.debug('hide:' + link);
            element.classList.add('WE___hook-search-_-_-hidden');
            element.classList.add('WE___hook-search-_-_-hidden-item');
        } else {
            outputGoogle.debug('view');
        }
    }

    injectHideSwitch(ServiceKind_Google);
}

