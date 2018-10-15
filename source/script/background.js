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

    // 比較関数だけ作っておきたかったけど転送できない
    var enabledItems = setting.hideItems.filter(function(i) {
        return i.word && i.word.length
    }).filter(function(i) {
        if(i.match.kind === 'regex') {
            try {
                new RegExp(i.word)
            } catch(ex) {
                outputBackground.error(JSON.stringify(i));
                outputBackground.error(ex);
                return false;
            }
        }

        return true;
    });

    var googleItems = enabledItems.filter(function(i) {
        return i.service.google;
    });
    var bingItems = enabledItems.filter(function(i) {
        return i.service.bing;
    });

    outputBackground.debug('googleItems.length: ' + googleItems.length);
    outputBackground.debug('bingItems.length: ' + bingItems.length);

    browser.runtime.onConnect.addListener(function(port) {
        outputBackground.debug('connected content!');
        outputBackground.debug(JSON.stringify(port));

        port.onMessage.addListener(function(message) {
            outputBackground.debug('send!');
            outputBackground.debug(JSON.stringify(message));

            switch(message.service) {
                case ServiceKind_Google:
                    port.postMessage({
                        kind: 'items',
                        data: {
                            items: googleItems,
                            enabled: setting.service.google.enabled
                        }
                    });
                    break;

                case ServiceKind_Bing:
                    port.postMessage({
                        kind: 'items',
                        data: {
                            items: bingItems,
                            enabled: setting.service.bing.enabled
                        }
                    });
                    break;

                default:
                    outputBackground.log('unknown service');
            }
        });

        browser.pageAction.onClicked.addListener(function(tab) {
            outputBackground.log('tab: ' + JSON.stringify(tab));
            if(tab.id === port.sender.tab.id) {
                port.postMessage({
                    kind: 'switch',
                    data: {
                        tab: tab
                    }
                });
            }
        });
    });    
}




