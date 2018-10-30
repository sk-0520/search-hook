import { ServiceKind } from "../share/define/service-kind";
import GoogleQuery from "../share/query/query-google";
import { IReadOnlyHideItemSetting } from "../share/setting/hide-item-setting";
import { ContentServiceBase, IHideElementSelector } from "./content";

export default class ContentGoogleService extends ContentServiceBase {

    get service(): ServiceKind {
        return ServiceKind.google;
    }

    constructor() {
        super('Content Google');
    }

    public initialize() {
        this.connect();
    }

    protected hideItems(hideItems: ReadonlyArray<IReadOnlyHideItemSetting>) {

        const checkers = this.getCheckers(hideItems);

        const elementSelectors: Array<IHideElementSelector> = [
            {
                target: 'smart',
                element: '#main > div',
                link: 'a[href^="/url?q="]'
            },
            {
                target: 'touch',
                element: '.srg > div',
                link: 'a[ping]'
            },
            {
                target: 'universal',
                element: '#universal > div',
                link: 'a'
            },
            {
                target: 'default',
                element: '.g',
                link: 'a'
            }
        ];

        this.hideItemsCore(elementSelectors, checkers);
    }

    protected eraseQuery(items: ReadonlyArray<string>) {
        const queryElement = document.querySelector('input[name="q"]') as HTMLInputElement;
        const queryValue = queryElement.value;
        this.logger.debug('q: ' + queryValue);

        const query = new GoogleQuery();

        const currentQuery = query.split(queryValue);
        const userInputQuery = query.getUserInput(currentQuery, items);
        this.logger.debug('u: ' + userInputQuery);

        queryElement.value = userInputQuery.join(' ') + ' ';

        // サジェストが鬱陶しい問題
        const suggestElement = document.querySelector('.sbdd_a, .gssb_c') as HTMLElement;
        if (suggestElement) {
            this.logger.debug('has suggest');
            const observer = new MutationObserver(mutations => {
                if (document.activeElement !== queryElement) {
                    if (suggestElement!.style.display !== 'none') {
                        this.logger.debug('suggest disable');
                        suggestElement!.style.display = 'none';
                    }
                } else {
                    this.logger.debug('suggest enable');
                }
                observer.disconnect();
            });
            const config = {
                attributes: true,
                childList: false,
                characterData: false
            };
            observer.observe(suggestElement, config);
        }
    }
}
