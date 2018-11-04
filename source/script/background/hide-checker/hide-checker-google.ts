import { HideCheckerBase } from "./hide-checker-base";
import { ServiceKind } from "../../share/define/service-kind";

export default class HideCheckerGoogle extends HideCheckerBase {

    public get service() {
        return ServiceKind.google;
    }

    constructor() {
        super('HideChecker Google');
    }

}
