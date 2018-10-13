'use strict'

const outputGoogle = createLogger('Google');

function resistGoogle(setting) {
    // Google 登録
    browser.webRequest.onBeforeRequest.addListener(
        function(requestDetails) {
            return requestGoogle(setting.service.google, requestDetails);
        },
        {
            urls: [
                "*://*.google.com/search?*"
            ]
        }
    );
}

function requestGoogle(googleSetting, requestDetails) {

    outputGoogle.log("Loading: " + requestDetails.url);
    outputGoogle.debug(JSON.stringify(requestDetails));

    if(!googleSetting.enabled) {
        outputGoogle.debug('disabled google');
        return;
    }

    outputGoogle.debug('enabled google');

    var url = new URL(requestDetails.url);
    var params = url.searchParams;


    // 既に検索済みのページとして何もしない
    if(!params.has('start')) {
        outputGoogle.debug('ignore request');
        return;
    }

    // 検索数の指定が無ければ設定値に書き換え
    if(!params.has('num')) {
        params.append('num', googleSetting.searchCount)
    }

    // まだ検索してないっぽければ無視
    if(!params.has('q')) {
        return;
    }

    var query = params.get('q');
    outputGoogle.debug("query: " + query);

    // 半角スペースで分割するが " で括られている場合の半角スペースは無視する

}
