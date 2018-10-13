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
    var baseSetting = createBaseSetting();

    var setting = result.setting;
    if(!setting) {
        // init
        setting = baseSetting;
    } else {
        setting = merge(baseSetting, setting);
    }
    setService(setting.service);
    setNotItems(setting.notItems);
    setHideItems(setting.hideItems);
}

function setService(serviceSetting) {
    function setGoogle(googleSetting) {
        document.querySelector('#service-is-enabled-google').checked = googleSetting.enabled;
        document.querySelector('#service-google-search-count').value = googleSetting.searchCount;
        document.querySelector('#service-google-search-safe').checked = googleSetting.searchSafe;
    }

    function setBing(bingSetting) {
        document.querySelector('#service-is-enabled-bing').checked = bingSetting.enabled;
        //document.querySelector('#service-bing-search-count').value = bingSetting.searchCount;
    }

    setGoogle(serviceSetting.google);
    setBing(serviceSetting.bing);
}

function getService() {

    return {
        google: {
            enabled: document.querySelector('#service-is-enabled-google').checked,
            searchCount: document.querySelector('#service-google-search-count').value,
            searchSafe: document.querySelector('#service-google-search-safe').checked
        },
        bing: {
            enabled: document.querySelector('#service-is-enabled-bing').checked
            //searchCount: document.querySelector('#service-bing-search-count').value
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

        var word = child.querySelector('[name=engine-not-item-word]').value;
        if(!word || !word.length || !word.trim().length) {
            output.debug('ignore: empty word');
            continue;
        }

        var item = {
            word: word,
            service: {
                google: child.querySelector('[name=engine-not-item-service-google]').checked,
                bing: child.querySelector('[name=engine-not-item-service-bing]').checked
            }
        };
        result.push(item);
    }


    return result;
}

function setHideItems(setting) {
    const parentElement = getHideItemParentElement();
    for(var i = 0; i < setting.length; i++) {
        var item = setting[i];
        addHideItemCore(parentElement, item);
    }
}


function getHideItems() {
    const parentElement = getHideItemParentElement();

    const children = parentElement.querySelectorAll('tr');
    output.debug(`child: ${children.length}`);

    var result = [];

    for(var i = 0; i < children.length; i++) {
        const child = children[i];

        var word = child.querySelector('[name=view-hide-item-host]').value;
        if(!word || !word.length || !word.trim().length) {
            output.debug('ignore: empty word');
            continue;
        }

        var item = {
            word: word,
            service: {
                google: child.querySelector('[name=view-hide-item-service-google]').checked,
                bing: child.querySelector('[name=view-hide-item-service-bing]').checked
            }
        };
        result.push(item);
    }


    return result;
}

function addNotItemFromInput(e) {
    e.preventDefault();

    var item = {
        word: document.querySelector('#engine-input-not-word').value,
        service: {
            google: document.querySelector('#engine-input-is-enabled-google').checked,
            bing: document.querySelector('#engine-input-is-enabled-bing').checked
        }
    };

    output.debug(JSON.stringify(item));
    addNotItem(item);

    document.querySelector('#engine-input-not-word').value = '';
    document.querySelector('#engine-input-is-enabled-google').checked = true;
    document.querySelector('#engine-input-is-enabled-bing').checked = true;
}

function getNotItemParentElement() {
    return document.querySelector('#engine-not-word-list');
}

function addNotItem(item) {
    addNotItemCore(getNotItemParentElement(), item);
}

function addNotItemCore(parent, item) {
    var groupElement = document.createElement('tr');

    var wordInputElement = document.createElement('input');
    wordInputElement.value = item.word;
    wordInputElement.setAttribute('name', 'engine-not-item-word');
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
    serviceGroupElement.className = 'horizontal';
    serviceGroupElement.appendChild(serviceElementCreator('google', 'engine-not-item-service-google', item.service.google));
    serviceGroupElement.appendChild(serviceElementCreator('bing', 'engine-not-item-service-bing', item.service.bing));

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

function addHideItemFromInput(e) {
    e.preventDefault();

    var item = {
        word: document.querySelector('#view-input-hide-host').value,
        service: {
            google: document.querySelector('#view-input-is-enabled-google').checked,
            bing: document.querySelector('#view-input-is-enabled-bing').checked
        }
    };

    output.debug(JSON.stringify(item));
    addHideItem(item);

    document.querySelector('#view-input-hide-host').value = '';
    document.querySelector('#view-input-is-enabled-google').checked = true;
    document.querySelector('#view-input-is-enabled-bing').checked = true;
}

function getHideItemParentElement() {
    return document.querySelector('#view-hide-host-list');
}

function addHideItem(item) {
    addHideItemCore(getHideItemParentElement(), item);
}

function addHideItemCore(parent, item) {
    var groupElement = document.createElement('tr');

    var wordInputElement = document.createElement('input');
    wordInputElement.value = item.word;
    wordInputElement.setAttribute('name', 'view-hide-item-host');
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
    serviceGroupElement.className = 'horizontal';
    serviceGroupElement.appendChild(serviceElementCreator('google', 'view-hide-item-service-google', item.service.google));
    serviceGroupElement.appendChild(serviceElementCreator('bing', 'view-hide-item-service-bing', item.service.bing));

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
        notItems: getNotItems(),
        hideItems: getHideItems()
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

document.querySelector('#command-engine-add-not-item').addEventListener('click', addNotItemFromInput);
document.querySelector('#command-view-add-hide-item').addEventListener('click', addHideItemFromInput);
