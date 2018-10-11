const output = {
    log: function(msg) {
        console.log(`<OP-S> [Background] ${msg}`);
    },
    debug: function(msg) {
        console.debug(`<OP-S> [Background] ${msg}`);
    },
    error: function(msg) {
        console.error(`<OP-S> [Background] ${msg}`);
    }
}

output.log("START");


var setting = null;
browser.storage.local.get('setting').then(
    loadSetting,
    function(error) {
        output.error(error);
    }
);

function loadSetting(result) {
    output.log("setting loading");
    setting = result.setting;

    if(!setting) {
        output.log('setting empty');
        return;
    }

    output.log('setting loaded');
    output.debug(JSON.stringify(setting));

    // Google 登録
    browser.webRequest.onBeforeRequest.addListener(
        requestGoogle,
        {
            urls: [
                "*://www.google.com/search?*",
                "*://google.com/search?*",
            ]
        }
    );
}

function requestGoogle(requestDetails) {
    output.log("Loading: " + requestDetails.url);
    output.debug(JSON.stringify(requestDetails));
}


