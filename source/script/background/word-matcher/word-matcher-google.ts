import { WordMatcherBase } from "./word-matcher-base";
import { ServiceKind } from "../../share/define/service-kind";

export class WordMatcherGoogle extends WordMatcherBase {

    public get service() {
        return ServiceKind.google;
    }

    constructor() {
        super('HideChecker Google');
    }

}
