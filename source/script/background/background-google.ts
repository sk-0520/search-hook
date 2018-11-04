import { ServiceKind } from '../share/define/service-kind';
import GoogleQuery from '../share/query/query-google';
import { BackgroundServiceBase, IRequestDetails, ISettingItems } from './background-base';
import { IReadOnlyGoogleServiceSetting } from '../share/setting/service-setting-google';
import HideCheckerGoogle from './hide-checker/hide-checker-google';
import { HideCheckerBase } from './hide-checker/hide-checker-base';

export default class BackgroundServiceGoogle extends BackgroundServiceBase<IReadOnlyGoogleServiceSetting> {

    protected get filter() {
        return {
            urls: [
                "*://*.google.com/search?*",
            ]
        };
    }

    public get service(): ServiceKind {
        return ServiceKind.google;
    }

    public constructor(setting: IReadOnlyGoogleServiceSetting, settingItems: ISettingItems) {
        super('Background Google', setting, settingItems);
    }

    protected createHideChecker(): HideCheckerBase {
        return new HideCheckerGoogle();
    }

    protected redirect(requestDetails: IRequestDetails, url: URL, notItemWords: ReadonlyArray<string>): browser.webRequest.BlockingResponse | undefined {
        // まだ検索してないっぽければ無視
        if (!url.searchParams.has('q')) {
            return;
        }

        // 既に検索済みのページとして何もしない
        if (url.searchParams.has('start')) {
            this.logger.debug('ignore request');
            return;
        }

        // 検索数の指定が無ければ設定値に書き換え
        if (!url.searchParams.has('num')) {
            url.searchParams.append('num', String(this.setting.searchCount));
        }

        // セーフサーチの指定が無ければ設定値に書き換え
        if (!url.searchParams.has('safe')) {
            if (this.setting.searchSafe) {
                url.searchParams.append('safe', 'strict');
            }
        }

        const rawQuery = url.searchParams.get('q')!;
        const queryString = this.tuneSearchWord(rawQuery, new GoogleQuery());

        url.searchParams.set('q', queryString);
        this.logger.debug(JSON.stringify(url));

        return {
            redirectUrl: url.toString(),
        };
    }

}
