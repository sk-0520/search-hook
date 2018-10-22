import * as shared from '../shared'
import * as conf from '../conf'
import BackgroundServiceBase from './background-service'

export default class BackgroundBingService extends BackgroundServiceBase {
    constructor() {
        super('Background Bing');
    }

    public resistRedirectBing(setting: conf.IMainSetting, notItems: Array<string>) {

        var requestSet = new Set();
        var bingSetting = setting.service.bing;
    
        // Google 登録
        browser.webRequest.onBeforeRequest.addListener(
            requestDetails => {
                const serviceKind = shared.ServiceKind.bing;

                this.logger.log('Loading: ' + requestDetails.url);
                this.logger.debug(JSON.stringify(requestDetails));
            
                if(!bingSetting.enabled) {
                    this.logger.debug('disabled bing');
                    return;
                }
            
                this.logger.debug('enabled bing');
            
                if(requestSet.has(requestDetails.requestId)) {
                    this.logger.debug('setted request: ' + requestDetails.requestId);
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
                    this.logger.debug('ignore request');
                    return;
                }
            
                // // 検索数の指定が無ければ設定値に書き換え
                // if(!url.searchParams.has('num')) {
                //     url.searchParams.append('num', bingSetting.searchCount)
                // }
            
                var rawQuery = url.searchParams.get('q')!;
                this.logger.debug('raw: ' + rawQuery);
                var queryItems = shared.splitQuery(serviceKind, rawQuery)
                this.logger.debug('items: ' + queryItems);
            
                var customQuery = shared.makeCustomQuery(serviceKind, queryItems, notItems);
                this.logger.debug('customQuery: ' + JSON.stringify(customQuery));
            
                var queryString = shared.toQueryString(serviceKind, customQuery.users.concat(customQuery.applications));
                this.logger.debug('queryString: ' + queryString);
            
                url.searchParams.set('q', queryString);
                this.logger.debug(JSON.stringify(url));
            
                return {
                    redirectUrl: url.toString()
                };
            },
            {
                urls: [
                    "*://*.bing.com/search?*"
                ]
            },
            ["blocking"]
        );
    }
    
}
