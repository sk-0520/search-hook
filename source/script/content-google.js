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

    var elementSelector = {
        element: '',
        link: ''
    };

    if(document.getElementById('navd')) {
        outputGoogle.debug('touch');

        elementSelector.element = '.srg > div';
        elementSelector.link = 'a[ping]';
    } else {
        outputGoogle.debug('plain');

        elementSelector.element = '.g';
        elementSelector.link = 'a';
    }

    var elements = document.querySelectorAll(elementSelector.element);
    outputGoogle.debug('elements: ' + elements.length);
    for(var i = 0; i < elements.length; i++) {
        var element = elements[i];
        var linkElement = element.querySelector(elementSelector.link);
        if(!linkElement) {
            continue;
        }

        var link = linkElement.getAttribute('href');
        outputGoogle.debug('link: ' + link);

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

        outputGoogle.debug('show: ' + link);
    }
    outputGoogle.debug('aaaaa');
 

}

