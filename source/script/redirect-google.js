'use strict'

const outputGoogle = createLogger('Google Engine');

function resistRedirectGoogle(setting, notItems, deliveryItems) {

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

    const serviceKind = ServiceKind_Google;

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

    // まだ検索してないっぽければ無視
    if(!url.searchParams.has('q')) {
        return;
    }

    // 既に検索済みのページとして何もしない
    if(url.searchParams.has('start')) {
        outputGoogle.debug('ignore request');
        return;
    }

    // 検索数の指定が無ければ設定値に書き換え
    if(!url.searchParams.has('num')) {
        url.searchParams.append('num', googleSetting.searchCount)
    }

    // セーフサーチの指定が無ければ設定値に書き換え
    if(!url.searchParams.has('safe')) {
        if(googleSetting.searchSafe) {
            url.searchParams.append('safe', 'strict')
        }
    }

    var rawQuery = url.searchParams.get('q');
    outputGoogle.debug('raw: ' + rawQuery);
    var queryItems = splitQuery(serviceKind, rawQuery)
    outputGoogle.debug('items: ' + queryItems);

    var customQuery = makeCustomQuery(serviceKind, queryItems, notItems);
    outputGoogle.debug('customQuery: ' + JSON.stringify(customQuery));

    var queryString = toQueryString(serviceKind, customQuery.users.concat(customQuery.applications));
    outputGoogle.debug('queryString: ' + queryString);

    url.searchParams.set('q', queryString);
    outputGoogle.debug(url);

    return {
        redirectUrl: url.toString()
    };
}


