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
    var baseSetting = {
        service: {
            google: {
                enabled: false,
                searchCount: 10
            },
            bing: {
                enabled: false,
                searchCount: 10
            }
        },
        notItems: []
    };

    var setting = result.setting;
    if(!setting) {
        // init
        setting = baseSetting;
    } else {
        setting = Object.assign(baseSetting, setting);
    }
    setService(setting.service);
    setNotItems(setting.notItems);
}

function setService(setting) {
    document.querySelector('#service-is-enabled-google').checked = setting.google.enabled;
    document.querySelector('#service-google-search-count').value = setting.google.searchCount;

    document.querySelector('#service-is-enabled-bing').checked = setting.bing.enabled;
    document.querySelector('#service-bing-search-count').value = setting.bing.searchCount;
}

function getService() {
    return {
        google: {
            enabled: document.querySelector('#service-is-enabled-google').checked,
            searchCount: document.querySelector('#service-google-search-count').value
        },
        bing: {
            enabled: document.querySelector('#service-is-enabled-bing').checked,
            searchCount: document.querySelector('#service-bing-search-count').value
        }
    };
}

function setNotItems(setting) {
    const parentElement = getNotItemParentElement();
    for(var i = 0; i < setting.length; i++) {
        var item = setting[i];
        addNotItemCore(parentElement, item);
    }
}

function getNotItems() {
    const parentElement = getNotItemParentElement();

    const children = parentElement.querySelectorAll('tr');
    output.debug(`child: ${children.length}`);

    var result = [];

    for(var i = 0; i < children.length; i++) {
        const child = children[i];

        var word = child.querySelector('[name=not-item-word]').value;
        if(!word || !word.length || !word.trim().length) {
            output.debug('ignore: empty word');
            continue;
        }

        var item = {
            word: word,
            service: {
                google: child.querySelector('[name=not-item-service-google]').checked
            }
        };
        result.push(item);
    }


    return result;

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
    wordInputElement.setAttribute('name', 'not-item-word');
    var wordElement = document.createElement('td');
    wordElement.appendChild(wordInputElement);

    var serviceElementCreator = function(displayValue, elementName, isChecked) {
        var check = document.createElement('input');
        check.setAttribute('type', 'checkbox');
        check.setAttribute('name', elementName);
        check.checked = isChecked;

        var label = document.createElement('label');
        label.appendChild(check);
        label.appendChild(document.createTextNode(displayValue));

        var li = document.createElement('li');
        li.appendChild(label);

        return li;
    }
    var serviceGroupElement = document.createElement('ul');
    serviceGroupElement.appendChild(serviceElementCreator('google', 'not-item-service-google', item.service.google));

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
        service: getService(),
        notItems: getNotItems()
    };

    browser.storage.local.set({
        setting: setting
    }).then(
        function(result) {
            browser.runtime.reload();
        },
        function(error) {
            output.error(error);
        }
    );

}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);

document.querySelector('#command-add-not-item').addEventListener('click', addNotItemFromInput);
