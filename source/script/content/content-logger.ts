import { ILogger, LogKind } from "../share/logger";
import { OutputLogBridgeData } from "../share/bridge/bridge-data";
import { BridgeMeesage } from "../share/bridge/bridge-meesage";
import { BridgeMeesageKind } from "../share/define/bridge-meesage-kind";

export class ContentLogger implements ILogger {

    public name: string;

    private port: browser.runtime.Port;

    constructor(name: string, port: browser.runtime.Port) {
        this.name = name;
        this.port = port;
    }

    private sendCore(isText: boolean, message: string, logKind: LogKind): void {
        this.port.postMessage(
            new BridgeMeesage(
                BridgeMeesageKind.outputLog,
                new OutputLogBridgeData(this.name, isText, message, logKind)
            )
        );
    }

    private sendText(message: string, logKind: LogKind): void {
        this.sendCore(true, message, logKind);
    }

    private sendObject(message: any, logKind: LogKind): void {
        this.sendCore(false, JSON.stringify(message), logKind);
    }

    public trace(value: string): void {
        this.sendText(value, LogKind.trace);
    }
    public debug(value: string): void {
        this.sendText(value, LogKind.debug);
    }
    public log(value: string): void {
        this.sendText(value, LogKind.information);
    }
    public warn(value: string): void {
        this.sendText(value, LogKind.warning);
    }
    public error(value: string): void {
        this.sendText(value, LogKind.error);
    }

    public table(value: any): void {
        this.sendObject(value, LogKind.table);
    }

    public dumpTrace(value: any): void {
        this.sendObject(value, LogKind.trace);
    }
    public dumpDebug(value: any): void {
        this.sendObject(value, LogKind.debug);
    }
    public dumpLog(value: any): void {
        this.sendObject(value, LogKind.information);
    }
    public dumpWarn(value: any): void {
        this.sendObject(value, LogKind.warning);
    }
    public dumpError(value: any): void {
        this.sendObject(value, LogKind.error);
    }

}
