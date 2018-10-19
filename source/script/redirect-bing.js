'use strict'

const outputBing = createLogger('Bing');

function resistRedirectBing(setting, notItems, deliveryItems) {

    var requestSet = new Set();

    // Bing 登録
    browser.webRequest.onBeforeRequest.addListener(
        function(requestDetails) {
            return requestBing(setting.service.bing, notItems, requestSet, requestDetails);
        },
        {
            urls: [
                "*://*.bing.com/search?*"
            ]
        },
        ["blocking"]
    );
}

function requestBing(bingSetting, notItems, requestSet, requestDetails) {

    const serviceKind = ServiceKind_Bing;

    outputBing.log('Loading: ' + requestDetails.url);
    outputBing.debug(JSON.stringify(requestDetails));

    if(!bingSetting.enabled) {
        outputBing.debug('disabled bing');
        return;
    }

    outputBing.debug('enabled bing');

    if(requestSet.has(requestDetails.requestId)) {
        outputBing.debug('setted request: ' + requestDetails.requestId);
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
    if(url.searchParams.has('first')) {
        outputBing.debug('ignore request');
        return;
    }

    // // 検索数の指定が無ければ設定値に書き換え
    // if(!url.searchParams.has('num')) {
    //     url.searchParams.append('num', bingSetting.searchCount)
    // }

    var rawQuery = url.searchParams.get('q');
    outputBing.debug('raw: ' + rawQuery);
    var queryItems = splitQuery(serviceKind, rawQuery)
    outputBing.debug('items: ' + queryItems);

    var customQuery = makeCustomQuery(serviceKind, queryItems, notItems);
    outputBing.debug('customQuery: ' + JSON.stringify(customQuery));

    var queryString = toQueryString(serviceKind, customQuery.users.concat(customQuery.applications));
    outputBing.debug('queryString: ' + queryString);

    url.searchParams.set('q', queryString);
    outputBing.debug(url);

    return {
        redirectUrl: url.toString()
    };
}


