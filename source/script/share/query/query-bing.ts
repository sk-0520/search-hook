import { ServiceKind } from "../define/service-kind";
import QueryBase from "./query-base";

export default class BingQuery extends QueryBase {

    get service(): ServiceKind {
        return ServiceKind.bing;
    }

    constructor() {
        super('BingQuery');
    }
}
