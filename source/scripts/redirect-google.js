'use strict'

const outputGoogle = createLogger('Google');

function resistGoogle(setting, deliveryItems) {

    var notItems = setting.notItems.filter(function(i) {
        return i.service.google;
    }).concat(deliveryItems).filter(function(i) {
        return i.word.length;
    }).map(function(i) {
        return i.word;
    });

    var requestSet = new Set();

    // Google 登録
    browser.webRequest.onBeforeRequest.addListener(
        function(requestDetails) {
            return requestGoogle(setting.service.google, notItems, requestSet, requestDetails);
        },
        {
            urls: [
                "*://*.google.com/search?*"
            ]
        },
        ["blocking"]
    );
}

function requestGoogle(googleSetting, notItems, requestSet, requestDetails) {

    outputGoogle.log('Loading: ' + requestDetails.url);
    outputGoogle.debug(JSON.stringify(requestDetails));

    if(!googleSetting.enabled) {
        outputGoogle.debug('disabled google');
        return;
    }

    outputGoogle.debug('enabled google');

    if(requestSet.has(requestDetails.requestId)) {
        outputGoogle.debug('setted request: ' + requestDetails.requestId);
        requestSet.delete(requestDetails.requestId);
        return;
    }
    requestSet.add(requestDetails.requestId);

    var url = new URL(requestDetails.url);

    // 検索数の指定が無ければ設定値に書き換え
    if(!url.searchParams.has('num')) {
        url.searchParams.append('num', googleSetting.searchCount)
    }

    // まだ検索してないっぽければ無視
    if(!url.searchParams.has('q')) {
        return;
    }

    // 既に検索済みのページとして何もしない
    if(url.searchParams.has('start')) {
        outputGoogle.debug('ignore request');
        return;
    }

    var rawQuery = url.searchParams.get('q');
    outputGoogle.debug('raw: ' + rawQuery);
    var queryItems = splitQuery(rawQuery)
    outputGoogle.debug('items: ' + queryItems);

    var customQuery = makeCustomQuery(queryItems, notItems);
    outputGoogle.debug('customQuery: ' + customQuery);

    var queryString = toQueryString(customQuery);
    outputGoogle.debug('queryString: ' + queryString);

    url.searchParams.set('q', queryString);
    outputGoogle.debug(url);

    return {
        redirectUrl: url.toString()
    };
}

function makeCustomQuery(queryItems, notItems) {
    // 既に存在する否定ワードはそのまま、設定されていなければ追加していく

    var addNotItems = notItems.concat();
    var customQuery = [];
    for(var i = 0; i < queryItems.length; i++) {
        var query = queryItems[i];

        if(!query.length) {
            continue;
        }

        if(query.charAt('-')) {
            var notWord = query.substr(1);
            var index = addNotItems.indexOf(notWord);
            customQuery.push(query);
            if(index !== -1) {
                addNotItems.splice(index, 1);
            }
        } else {
            customQuery.push(query);
        }
    }

    outputGoogle.debug('notItems: ' + notItems);
    outputGoogle.debug('addNotItems: ' + addNotItems);

    for(var i = 0; i < addNotItems.length; i++) {
        var word = addNotItems[i];
        customQuery.push('-' + word);
    }

    outputGoogle.debug('customQuery: ' + customQuery);

    return customQuery;
}

function toQueryString(queryItems) {
    var items = queryItems.filter(function(s) {
        return s && s.length;
    }).map(function(s) {
        if(s.indexOf(' ') !== -1) {
            if(s.charAt(0) === '-') {
                return '-"' + s.substr(1) + '"';
            }

            return '"' + s + '"';
        } else {
            return s;
        }
    });

    return items.join(' ');
}
