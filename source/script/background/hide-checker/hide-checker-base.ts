import { LoggingBase } from "../../share/common";
import { IService, ServiceKind } from "../../share/define/service-kind";
import { IHideCheker } from "../hide-item-stocker";

export abstract class HideCheckerBase extends LoggingBase implements IService {

    public abstract readonly service: ServiceKind;

    constructor(name: string) {
        super(name);
    }


    private matchUrlCore(linkValue: string, checkers: ReadonlyArray<IHideCheker>): boolean {

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

        return checkers.some(i => i.match(urlValue));
    }

    protected matchSimpleUrl(linkValue: string, checkers: ReadonlyArray<IHideCheker>): boolean {
        return this.matchUrlCore(linkValue, checkers);
    }

    protected matchQueryUrl(linkValue: string, checkers: ReadonlyArray<IHideCheker>): boolean {
        try {
            const index = linkValue.indexOf('?');
            if (index !== -1) {
                const params = new URLSearchParams(linkValue.substr(index + 1));
                this.logger.debug('params: ' + params);

                if (params.has('q')) {
                    const query = params.get('q')!;
                    this.logger.debug('q: ' + query);

                    return this.matchUrlCore(query, checkers);
                }
            }
        } catch (ex) {
            this.logger.error(ex);
        }

        return false;
    }

    public matchUrl(linkValue: string, checkers: ReadonlyArray<IHideCheker>) {

        // 普通パターン
        if (this.matchSimpleUrl(linkValue, checkers)) {
            return true;
        }

        // /path?q=XXX 形式
        if (this.matchQueryUrl(linkValue, checkers)) {
            return true;
        }

        return false;
    }

}
