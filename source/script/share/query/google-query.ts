import { ServiceKind } from "../service-kind";
import QueryBase from "./query-base";

export default class GoogleQuery extends QueryBase {

    constructor() {
        super(ServiceKind.google, 'GoogleQuery');
    }

}
