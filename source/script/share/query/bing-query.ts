import QueryBase from "./query-base";
import { ServiceKind } from "../common";

export default class BingQuery extends QueryBase {

    constructor() {
        super(ServiceKind.bing,'BingQuery');
    }

}