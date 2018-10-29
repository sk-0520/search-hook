import { ServiceKind } from '../share/define/service-kind';
import BingQuery from '../share/query/query-bing';
import { BackgroundServiceBase, IRequestDetails, ISettingItems } from './background-service';
import { IReadOnlyBingServiceSetting } from '../share/setting/service-setting-bing';

export default class BackgroundServiceBing extends BackgroundServiceBase<IReadOnlyBingServiceSetting> {

    protected get filter() {
        return {
            urls: [
                "*://*.bing.com/search?*",
            ]
        };
    }

    public get service(): ServiceKind {
        return ServiceKind.bing;
    }

    public constructor(setting: IReadOnlyBingServiceSetting, settingItems: ISettingItems) {
        super('Background Bing', setting, settingItems);
    }

    protected redirect(requestDetails: IRequestDetails, url: URL, notItemWords: ReadonlyArray<string>): browser.webRequest.BlockingResponse | undefined {
        // まだ検索してないっぽければ無視
        if (!url.searchParams.has('q')) {
            return;
        }

        // 既に検索済みのページとして何もしない
        if (url.searchParams.has('first')) {
            this.logger.debug('ignore request');
            return;
        }

        // // 検索数の指定が無ければ設定値に書き換え
        // if(!url.searchParams.has('num')) {
        //     url.searchParams.append('num', bingSetting.searchCount)
        // }

        const rawQuery = url.searchParams.get('q')!;
        const queryString = this.tuneSearchWord(rawQuery, new BingQuery());

        url.searchParams.set('q', queryString);
        this.logger.debug(JSON.stringify(url));

        return {
            redirectUrl: url.toString(),
        };
    }


}
