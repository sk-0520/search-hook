import * as conf from '../conf'
import BackgroundServiceBase from './background-service'
import GoogleQuery from '../share/query/google-query';

export default class BackgroundGoogle extends BackgroundServiceBase {
    constructor() {
        super('Background Google');
    }

    public resistRedirectGoogle(setting: conf.IMainSetting, notItems: Array<string>) {

        var requestSet = new Set();
        var googleSetting = setting.service.google;
    
        // Google 登録
        browser.webRequest.onBeforeRequest.addListener(
            requestDetails => {
                this.logger.log('Loading: ' + requestDetails.url);
                this.logger.debug(JSON.stringify(requestDetails));
            
                if(!googleSetting.enabled) {
                    this.logger.debug('disabled google');
                    return;
                }
            
                this.logger.debug('enabled google');
            
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
                if(url.searchParams.has('start')) {
                    this.logger.debug('ignore request');
                    return;
                }
            
                // 検索数の指定が無ければ設定値に書き換え
                if(!url.searchParams.has('num')) {
                    url.searchParams.append('num', String(googleSetting.searchCount))
                }
            
                // セーフサーチの指定が無ければ設定値に書き換え
                if(!url.searchParams.has('safe')) {
                    if(googleSetting.searchSafe) {
                        url.searchParams.append('safe', 'strict')
                    }
                }
            
                var query = new GoogleQuery();

                var rawQuery = url.searchParams.get('q')!;
                this.logger.debug('raw: ' + rawQuery);
                var queryItems = query.splitQuery(rawQuery)
                this.logger.debug('items: ' + queryItems);
            
                var customQuery = query.makeCustomQuery(queryItems, notItems);
                this.logger.debug('customQuery: ' + JSON.stringify(customQuery));
            
                var queryString = query.toQueryString(customQuery.users.concat(customQuery.applications));
                this.logger.debug('queryString: ' + queryString);
            
                url.searchParams.set('q', queryString);
                this.logger.debug(JSON.stringify(url));
            
                return {
                    redirectUrl: url.toString()
                };
            },
            {
                urls: [
                    "*://*.google.com/search?*"
                ]
            },
            ["blocking"]
        );
    }
    
}
