import { ServiceKind } from "../share/define/service-kind";
import BingQuery from "../share/query/query-bing";
import { IReadOnlyHideItemSetting } from "../share/setting/hide-item-setting";
import { ContentServiceBase } from "./content";

export default class ContentBingService extends ContentServiceBase {
    
    get service(): ServiceKind {
        return ServiceKind.bing;
    }
    
    constructor() {
        super('Content Bing');
    }

    public initialize() {
        this.connect();
    }

    protected hideItems(hideItems: ReadonlyArray<IReadOnlyHideItemSetting>) {

        const checkers = this.getCheckers(hideItems);

        const elementSelectors = [
            {
                target: 'default',
                element: '.b_algo',
                link: 'a'
            },
        ];

        let success = false;
        for (const elementSelector of elementSelectors) {
            this.logger.debug('target: ' + elementSelector.target);

            const elements = document.querySelectorAll(elementSelector.element);
            this.logger.debug('elements: ' + elements.length);

            for (const element of elements) {

                const linkElement = element.querySelector(elementSelector.link);
                if (!linkElement) {
                    continue;
                }

                const link = linkElement.getAttribute('href')! || '';
                this.logger.debug('link: ' + link);

                // 普通パターン
                if (this.matchSimpleUrl(link, checkers)) {
                    this.hideElement(element);
                    success = true;
                    continue;
                }

                // /path?q=XXX 形式
                if (this.matchQueryUrl(link, checkers)) {
                    this.hideElement(element);
                    success = true;
                    continue;
                }

                this.logger.debug('show: ' + link);
            }

            if (success) {
                break;
            }
        }

        if (success) {
            this.appendHiddenSwitch();
        }
    }

    protected eraseQuery(items: ReadonlyArray<string>) {
        const queryElement = document.querySelector('input[name="q"]') as HTMLInputElement;
        const queryValue = queryElement.value;
        this.logger.debug('q: ' + queryValue);

        const query = new BingQuery();

        const currentQuery = query.splitQuery(queryValue);
        const userInputQuery = query.getUserInputQuery(currentQuery, items);
        this.logger.debug('u: ' + userInputQuery);

        queryElement.value = userInputQuery.join(' ') + ' ';
    }
}
