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

        case 'switch':
            outputGoogle.debug("switch");
            switchHideItems();
            break;
    }

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
        if(!linkElement) {
            continue;
        }

        // めっちゃ嘘くさい。。。
        var link = linkElement.getAttribute('href');

        // PC で普通にみるパターン
        if(matchUrl(link, checkers)) {
            outputGoogle.debug('hide: ' + link);
            hideElement(element);
            continue;
        } 
        
        try {
            var baseUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            outputGoogle.debug('baseUrl: ' + baseUrl);
            var url = new URL(link.charAt(0) === '/' ? link.substr(1): link, baseUrl);
            outputGoogle.debug('url: ' + url);

            if(url.searchParams.has('q')) {
                var query = url.searchParams.get('q');
                if(matchUrl(query, checkers)) {
                    outputGoogle.debug('hide: ' + link);
                    hideElement(element);
                    continue;
                }
            }
        } catch(ex) {
            outputGoogle.debug(ex);
        }

        outputGoogle.debug('show: ' + link);
    }
}

