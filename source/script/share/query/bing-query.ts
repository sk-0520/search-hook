import { ServiceKind } from "../define/service-kind";
import QueryBase from "./query-base";

export default class BingQuery extends QueryBase {

    constructor() {
        super(ServiceKind.bing, 'BingQuery');
    }
}
