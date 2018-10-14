'use strict'

const outputBackground = createLogger('Background');
outputBackground.log("START");

browser.storage.local.get('setting').then(
    function(result) {
        outputBackground.log("setting loading");
        const setting = result.setting;

        if(!setting) {
            outputBackground.log('setting empty');
            return;
        }

        outputBackground.log('setting loaded');
        outputBackground.debug(JSON.stringify(setting));

        resistRedirectGoogle(setting, []);
        resistRedirectBing(setting, []);

        resistView(setting, {});
    },
    function(error) {
        outputBackground.error(error);
    }
);

function resistView(setting, deliveryItems) {

    var enabledItems = setting.hideItems.filter(function(i) {
        return i.word && i.word.length
    });

    var googleItems = enabledItems.filter(function(i) {
        return i.service.google;
    }).map(function(i) {
    });
    var bingItems = enabledItems.filter(function(i) {
        return i.service.bing;
    }).map(function(i) {
    });

    browser.runtime.onConnect.addListener(function(port) {
        outputBackground.debug('connected content!');
        outputBackground.debug(JSON.stringify(port));

        port.onMessage.addListener(function(message) {
            outputBackground.debug('send!');
            outputBackground.debug(JSON.stringify(message));

            switch(message.service) {
                case ServiceKind_Google:
                    port.postMessage({items: googleItems});
                    break;

                case ServiceKind_Bing:
                    port.postMessage({items: bingItems});
                    break;

                default:
                    outputBackground.log('unknown service');
            }
        });
    });
}




