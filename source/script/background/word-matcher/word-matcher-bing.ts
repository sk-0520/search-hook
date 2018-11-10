import { WordMatcherBase } from "./word-matcher-base";
import { ServiceKind } from "../../share/define/service-kind";

export class WordMatcherBing extends WordMatcherBase {

    public get service() {
        return ServiceKind.bing;
    }

    constructor() {
        super('HideChecker Bing');
    }

}
