import { ServiceKind } from "../define/service-kind";
import { QueryBase } from "./query";

export default class BingQuery extends QueryBase {

    public get service(): ServiceKind {
        return ServiceKind.bing;
    }

    public constructor() {
        super('BingQuery');
    }
}
