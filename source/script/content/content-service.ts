import * as shared from "../shared";

export default abstract class ContentServiceBase extends shared.ActionBase {
    constructor(name:string) {
        super(name);
    }
}