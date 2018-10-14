'use strict'

const outputGoogle = createLogger('Google Content');

const port = browser.runtime.connect();
port.onMessage.addListener(function(message) {
    port.disconnect();
    
    outputGoogle.debug("CLIENT RECV!");
    outputGoogle.debug(JSON.stringify(message));
    hideGoogleItems(message.items);
});
port.postMessage({service: ServiceKind_Google});

function hideGoogleItems(hideItems) {
    var elements = document.querySelectorAll('.g');
    for(var i = 0; i < elements.length; i++) {
        var element = elements[i];
        var linkElement = element.querySelector('a');

        // めっちゃ嘘くさい。。。
        var link = linkElement.getAttribute('href');
        outputGoogle.debug('linkUrl: ' + link);

        
    }
}

