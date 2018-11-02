import { Logger } from "../share/common";


export class ContentLogger extends Logger {

    private port: browser.runtime.Port;
    
    constructor(name: string, port: browser.runtime.Port) {
        super(name);
        this.port = port;
    }
}
