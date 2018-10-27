import { ServiceKind } from "../define/service-kind";
import QueryBase from "./query-base";

export default class GoogleQuery extends QueryBase {

    get service(): ServiceKind {
        return ServiceKind.google;
    }

    constructor() {
        super('GoogleQuery');
    }
}
