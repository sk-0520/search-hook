import * as shared from "../share/common";

export default abstract class ContentServiceBase extends shared.ActionBase {
    constructor(name: string) {
        super(name);
    }
}
