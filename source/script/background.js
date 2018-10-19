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

        resistRedirectGoogle(setting, filterNotItems(ServiceKind_Google, setting));
        resistRedirectBing(setting, filterNotItems(ServiceKind_Bing, setting));

        resistView(setting, {});
    },
    function(error) {
        outputBackground.error(error);
    }
);

function filterNotItems(service, setting) {
    outputBackground.log(service);

    var notItems = setting.notItems.filter(function(i) {
        switch(service) {
            case ServiceKind_Google:
                return i.service.google;

            case ServiceKind_Bing:
                return i.service.bing;

            default:
                throw { error: i };
        }
    }).filter(function(i) {
        return i.word.length;
    }).map(function(i) {
        return i.word;
    });

    return notItems;
}

function resistView(setting) {

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

    var googleHideItems = enabledItems.filter(function(i) {
        return i.service.google;
    });
    var bingHideItems = enabledItems.filter(function(i) {
        return i.service.bing;
    });

    outputBackground.debug('googleHideItems.length: ' + googleHideItems.length);
    outputBackground.debug('bingHideItems.length: ' + bingHideItems.length);

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
                            items: googleHideItems,
                            enabled: setting.service.google.enabled
                        }
                    });
                    port.postMessage({
                        kind: 'erase',
                        data: {
                            items: filterNotItems(ServiceKind_Google, setting),
                            enabled: setting.service.google.enabled
                        }
                    })
                    break;

                case ServiceKind_Bing:
                    port.postMessage({
                        kind: 'items',
                        data: {
                            items: bingHideItems,
                            enabled: setting.service.bing.enabled
                        }
                    });
                    port.postMessage({
                        kind: 'erase',
                        data: {
                            items: filterNotItems(ServiceKind_Bing, setting),
                            enabled: setting.service.bing.enabled
                        }
                    });
                    break;

                default:
                    outputBackground.log('unknown service');
            }
        });
    });
}




