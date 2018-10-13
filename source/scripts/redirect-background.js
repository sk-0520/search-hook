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

        resistGoogle(setting, []);
    },
    function(error) {
        outputBackground.error(error);
    }
);






