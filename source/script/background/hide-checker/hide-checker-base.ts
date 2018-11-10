import { LoggingBase, checkService } from "../../share/common";
import { IService, ServiceKind } from "../../share/define/service-kind";
import { IWordMatcher } from "../hide-item-stocker";

export abstract class HideCheckerBase extends LoggingBase implements IService {

    public abstract readonly service: ServiceKind;

    constructor(name: string) {
        super(name);
    }


    private matchUrlCore(linkValue: string, hideMachers: ReadonlyArray<IWordMatcher>): boolean {
        let url: URL;
        try {
            url = new URL(linkValue);
        } catch (ex) {
            this.logger.error(ex);
            return false;
        }

        // プロトコル、ポート、パスワード云々は無視
        let urlValue = url.hostname;
        if (url.pathname && url.pathname.length) {
            urlValue += url.pathname;
        }
        if (url.search && url.search.length) {
            urlValue += url.search;
        }

        return hideMachers.some(i => i.match(urlValue));
    }

    protected matchSimpleUrl(linkValue: string, hideMachers: ReadonlyArray<IWordMatcher>): boolean {
        return this.matchUrlCore(linkValue, hideMachers);
    }

    protected matchQueryUrl(linkValue: string, hideMachers: ReadonlyArray<IWordMatcher>): boolean {
        try {
            const index = linkValue.indexOf('?');
            if (index !== -1) {
                const params = new URLSearchParams(linkValue.substr(index + 1));
                this.logger.debug('params: ' + params);

                if (params.has('q')) {
                    const query = params.get('q')!;
                    this.logger.debug('q: ' + query);

                    return this.matchUrlCore(query, hideMachers);
                }
            }
        } catch (ex) {
            this.logger.error(ex);
        }

        return false;
    }

    public matchUrl(linkValue: string, hideMachers: ReadonlyArray<IWordMatcher>) {

        const enabledHideMachers = hideMachers.filter(i => checkService(this.service, i.item.service));
        if (!enabledHideMachers.length) {
            return false;
        }

        // 普通パターン
        if (this.matchSimpleUrl(linkValue, enabledHideMachers)) {
            return true;
        }

        // /path?q=XXX 形式
        if (this.matchQueryUrl(linkValue, enabledHideMachers)) {
            return true;
        }

        return false;
    }

}
