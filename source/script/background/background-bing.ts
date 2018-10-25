import BingQuery from '../share/query/bing-query';
import { IMainSetting } from '../share/setting/main-setting';
import BackgroundServiceBase from './background-service-base';

export default class BackgroundBingService extends BackgroundServiceBase {
    constructor() {
        super('Background Bing');
    }

    public resistRedirectBing(setting: IMainSetting, notItems: Array<string>) {

        const requestSet = new Set();
        const bingSetting = setting.service.bing;
    
        // Google 登録
        browser.webRequest.onBeforeRequest.addListener(
            requestDetails => {
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
            
                const url = new URL(requestDetails.url);
            
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

                const query = new BingQuery();
            
                const rawQuery = url.searchParams.get('q')!;
                this.logger.debug('raw: ' + rawQuery);
                const queryItems = query.splitQuery(rawQuery);
                this.logger.debug('items: ' + queryItems);
            
                const customQuery = query.makeCustomQuery(queryItems, notItems);
                this.logger.debug('customQuery: ' + JSON.stringify(customQuery));
            
                const queryString = query.toQueryString(customQuery.users.concat(customQuery.applications));
                this.logger.debug('queryString: ' + queryString);
            
                url.searchParams.set('q', queryString);
                this.logger.debug(JSON.stringify(url));
            
                return {
                    redirectUrl: url.toString(),
                };
            },
            {
                urls: [
                    "*://*.bing.com/search?*",
                ],
            },
            ["blocking"],
        );
    }
    
}
