import { HideCheckerBase } from "./hide-checker-base";
import { ServiceKind } from "../../share/define/service-kind";

export default class HideCheckerBing extends HideCheckerBase {

    public get service() {
        return ServiceKind.bing;
    }

    constructor() {
        super('HideChecker Bing');
    }

}
