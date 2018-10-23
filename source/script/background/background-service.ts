import * as shared from '../share/common';

export default abstract class BackgroundServiceBase extends shared.LoggingBase {
    constructor(name: string) {
        super(name);
    }
}
