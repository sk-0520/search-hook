import QueryBase from "./query-base";
import { ServiceKind } from "../common";

export default class GoogleQuery extends QueryBase {

    constructor() {
        super(ServiceKind.google,'GoogleQuery');
    }

}