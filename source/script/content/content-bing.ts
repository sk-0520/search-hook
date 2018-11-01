import { ServiceKind } from "../share/define/service-kind";
import BingQuery from "../share/query/query-bing";
import { ContentServiceBase, IHideElementSelector } from "./content";
import { QueryBase } from "../share/query/query";

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

    protected createQuery(): QueryBase {
        return new BingQuery();
    }

    protected getQueryInputElement() {
        const queryElement = document.querySelector('input[name="q"]') as HTMLInputElement;
        return queryElement;
    }

    protected getHideElementSelectors(): ReadonlyArray<IHideElementSelector> {
        const elementSelectors: Array<IHideElementSelector> = [
            {
                target: 'default',
                element: '.b_algo',
                link: 'a'
            },
        ];

        return elementSelectors;
    }

}
