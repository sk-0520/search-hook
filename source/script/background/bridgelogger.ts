import { Logger } from "../share/logger";

export default class BridgeLoger extends Logger {

    constructor(name: string) {
        super('(Bridge) ' + name);
        this.header = `${this.header}🛴`;
    }
}
