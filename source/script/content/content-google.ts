import { ServiceKind } from "../share/define/service-kind";
import GoogleQuery from "../share/query/query-google";
import { ContentServiceBase, IHideElementSelector } from "./content";
import { QueryBase } from "../share/query/query";

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

    protected createQuery(): QueryBase {
        return new GoogleQuery();
    }

    protected getQueryInputElement(): HTMLInputElement {
        const queryElement = document.querySelector('input[name="q"]') as HTMLInputElement;
        return queryElement;
    }

    protected getHideElementSelectors(): ReadonlyArray<IHideElementSelector> {
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
        
        return elementSelectors;
    }

}
