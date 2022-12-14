import { ServiceKind } from "../define/service-kind";
import { QueryBase } from "./query-base";

export default class GoogleQuery extends QueryBase {

    public get service(): ServiceKind {
        return ServiceKind.google;
    }

    public constructor() {
        super('GoogleQuery');
    }
}
