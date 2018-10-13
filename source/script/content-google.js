'use strict'

const outputGoogle = createLogger('Google Content');

//const googlePort = browser.runtime.connect({ name:"view-google-content" });
var myPort = browser.runtime.connect({name:"port-from-cs"});
myPort.postMessage({greeting: "hello from content script"});

myPort.onMessage.addListener(function(m) {
    console.log("Z");
    console.log(m.greeting);
  });

function hideGoogleItems() {
    var elements = document.querySelectorAll('.g');
    for(var i = 0; i < elements.length; i++) {
        var element = elements[i];
        var linkElement = element.querySelector('a');

        // めっちゃ嘘くさい。。。
        var link = linkElement.getAttribute('href');
        var linkUrl = new URL(link);
        outputGoogle.debug('linkUrl: ' + linkUrl);
    }

    myPort.postMessage({greeting: "A"});
}

hideGoogleItems();
