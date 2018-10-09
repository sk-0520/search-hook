function restoreOptions() {

    function restoreOptionsGoogle(googleSetting) {
        document.querySelector('#is-enabled-google').checked = googleSetting.isEnabled
    }

    function restoreOptionsCore(result) {
        if(result.setting){
            const setting = result.setting;

            if(setting.google) {
                restoreOptionsGoogle(setting.google)
            }
        }
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    var getting = browser.storage.local.get('setting');
    getting.then(restoreOptionsCore, onError);
}

function saveOptions(e) {
    e.preventDefault();
    browser.storage.local.set({
        setting: {
            google: {
                isEnabled: document.querySelector('#is-enabled-google').checked
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);
