
export enum LogKind {
    trace,
    debug,
    information,
    warning,
    error,
    
    table,
}

export interface ILogger {
    readonly name: string;

    trace(value: string): void;
    debug(value: string): void;
    log(value: string): void;
    warn(value: string): void;
    error(value: string): void;

    table(value: any): void;

    dumpTrace(value: any): void;
    dumpDebug(value: any): void;
    dumpLog(value: any): void;
    dumpWarn(value: any): void;
    dumpError(value: any): void;
}

export class Logger implements ILogger {
    public readonly name: string;

    protected header = '🔍';

    constructor(name: string) {
        this.name = name;
    }

    public trace(value: string): void {
        console.trace(`${this.header} ${this.name} ${value}`);
    }
    public debug(value: string): void {
        console.debug(`${this.header} ${this.name} ${value}`);
    }
    public log(value: string): void {
        console.log(`${this.header} ${this.name} ${value}`);
    }
    public warn(value: string): void {
        console.warn(`${this.header} ${this.name} ${value}`);
    }
    public error(value: string): void {
        console.error(`${this.header} ${this.name} ${value}`);
    }

    public table(value: any): void {
        this.log('TABLE:');
        console.table(value);
    }

    public dumpTrace(value: any): void {
        this.trace(JSON.stringify(value));
    }
    public dumpDebug(value: any): void {
        this.debug(JSON.stringify(value));
    }
    public dumpLog(value: any): void {
        this.log(JSON.stringify(value));
    }
    public dumpWarn(value: any): void {
        this.warn(JSON.stringify(value));
    }
    public dumpError(value: any): void {
        this.error(JSON.stringify(value));
    }
}
