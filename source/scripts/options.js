'use strict'

const output = createLogger('Options');

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

function addNotItemFromInput(e) {
    e.preventDefault();

    var item = {
        word: document.querySelector('#input-not-word').value,
        service: {
            google: document.querySelector('#input-is-enabled-google').checked
        }
    };

    output.debug(JSON.stringify(item));
    addNotItem(item);

    document.querySelector('#input-not-word').value = '';
    document.querySelector('#input-is-enabled-google').checked = true;
}

function getNotItemParentElement() {
    return document.querySelector('#not-word-list');
}

function addNotItem(item) {
    addNotItemCore(getNotItemParentElement(), item);
}

function addNotItemCore(parent, item) {
    var groupElement = document.createElement('tr');

    var wordInputElement = document.createElement('input');
    wordInputElement.value = item.word;
    var wordElement = document.createElement('td');
    wordElement.appendChild(wordInputElement);

    var serviceElementCreator = function(serviceName, isChecked) {
        var check = document.createElement('input');
        check.setAttribute('type', 'checkbox');
        check.checked = isChecked;

        var label = document.createElement('label');
        label.appendChild(check);
        label.appendChild(document.createTextNode(serviceName));

        var li = document.createElement('li');
        li.appendChild(label);

        return li;
    }
    var serviceGroupElement = document.createElement('ul');
    serviceGroupElement.appendChild(serviceElementCreator('google', item.service.google));

    var serviceElement = document.createElement('td');
    serviceElement.appendChild(serviceGroupElement);

    var removeCommandElement = document.createElement('button');
    removeCommandElement.appendChild(document.createTextNode('remove'));
    removeCommandElement.addEventListener('click', function(e) {
        e.preventDefault();

        groupElement.remove();
    });
    var removeElement = document.createElement('td');
    removeElement.appendChild(removeCommandElement);

    groupElement.appendChild(wordElement);
    groupElement.appendChild(serviceElement);
    groupElement.appendChild(removeElement);

    parent.appendChild(groupElement);
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

document.querySelector('#command-add-not-item').addEventListener('click', addNotItemFromInput);
