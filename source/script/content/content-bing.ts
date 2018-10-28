import { ServiceKind } from "../share/define/service-kind";
import BingQuery from "../share/query/query-bing";
import { IReadOnlyHideItemSetting } from "../share/setting/hide-item-setting";
import { ContentServiceBase, IHideElementSelector } from "./content";

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

        const elementSelectors: Array<IHideElementSelector> = [
            {
                target: 'default',
                element: '.b_algo',
                link: 'a'
            },
        ];

        this.hideItemsCore(elementSelectors, checkers);
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
