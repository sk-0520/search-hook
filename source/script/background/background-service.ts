import * as shared from '../shared'

export default abstract class BackgroundServiceBase extends shared.LoggingBase {
    constructor(name: string) {
        super(name);
    }
}
