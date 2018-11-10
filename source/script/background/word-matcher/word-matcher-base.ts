import { LoggingBase, checkService } from "../../share/common";
import { IService, ServiceKind } from "../../share/define/service-kind";
import { IWordMatcher } from "../hide-item-stocker";

export abstract class WordMatcherBase extends LoggingBase implements IService {

    public abstract readonly service: ServiceKind;

    constructor(name: string) {
        super(name);
    }


    private matchUrlCore(linkValue: string, wordMachers: ReadonlyArray<IWordMatcher>): boolean {
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

        return wordMachers.some(i => i.match(urlValue));
    }

    protected matchSimpleUrl(linkValue: string, wordMachers: ReadonlyArray<IWordMatcher>): boolean {
        return this.matchUrlCore(linkValue, wordMachers);
    }

    protected matchQueryUrl(linkValue: string, wordMachers: ReadonlyArray<IWordMatcher>): boolean {
        try {
            const index = linkValue.indexOf('?');
            if (index !== -1) {
                const params = new URLSearchParams(linkValue.substr(index + 1));
                this.logger.debug('params: ' + params);

                if (params.has('q')) {
                    const query = params.get('q')!;
                    this.logger.debug('q: ' + query);

                    return this.matchUrlCore(query, wordMachers);
                }
            }
        } catch (ex) {
            this.logger.error(ex);
        }

        return false;
    }

    public matchUrl(linkValue: string, wordMachers: ReadonlyArray<IWordMatcher>) {

        const enabledWordMachers = wordMachers.filter(i => checkService(this.service, i.item.service));
        if (!enabledWordMachers.length) {
            return false;
        }

        // 普通パターン
        if (this.matchSimpleUrl(linkValue, enabledWordMachers)) {
            return true;
        }

        // /path?q=XXX 形式
        if (this.matchQueryUrl(linkValue, enabledWordMachers)) {
            return true;
        }

        return false;
    }

}
