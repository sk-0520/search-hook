const output = {
    log: function(msg) {
        console.log(`<OP-S> [Options] ${msg}`);
    },
    debug: function(msg) {
        console.debug(`<OP-S> [Options] ${msg}`);
    },
    error: function(msg) {
        console.error(`<OP-S> [Options] ${msg}`);
    }
};

function restoreOptions() {
    var getting = browser.storage.local.get('setting');
    getting.then(
        restoreOptionsCore,
        function(error) {
            output.error(error)
        }
    );
}

function restoreOptionsCore(result) {
    let setting = result.setting;
    if(!setting) {
        // init
        setting = {
            global: {
                enabled: {
                    google: false
                }
            },
            notItems: [
                { }
            ]
        };
    }
    setGlobal(setting.global);
    setNotItems(setting.notItems);
}

function setGlobal(setting) {
    document.querySelector('#is-enabled-google').checked = setting.enabled.google;
}

function getGlobal() {
    return {
        enabled: {
            google: document.querySelector('#is-enabled-google').checked
        }
    };
}

function setNotItems(setting) {

}

function getNotItems() {
    return [];
}


function saveOptions(e) {
    e.preventDefault();

    const setting = {
        global: getGlobal()
    };

    browser.storage.local.set({
        setting: setting
    });

    browser.runtime.reload();
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);
