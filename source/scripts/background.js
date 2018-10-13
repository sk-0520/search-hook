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
};

output.log("START");

browser.storage.local.get('setting').then(
    loadSetting,
    function(error) {
        output.error(error);
    }
);

var setting = null;
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
                "*://*.google.com/search?*"
            ]
        }
    );
}

function requestGoogle(requestDetails) {
    output.log("Loading: " + requestDetails.url);
    output.debug(JSON.stringify(requestDetails));

    if(!setting.global.enabled.google) {
        output.debug('disabled google');
        return;
    }

    output.debug('enabled google');

}


