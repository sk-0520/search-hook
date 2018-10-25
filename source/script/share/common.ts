// contents script, background script 共有

export class Logger {
    public readonly name: string;

    constructor(name: string) {
        this.name = name;
    }

    public trace(value: string): void {
        console.trace(`<SH> ${this.name} ${value}`);
    }
    public debug(value: string): void {
        console.debug(`<SH> ${this.name} ${value}`);
    }
    public log(value: string): void {
        console.log(`<SH> ${this.name} ${value}`);
    }
    public warn(value: string): void {
        console.warn(`<SH> ${this.name} ${value}`);
    }
    public error(value: string): void {
        console.error(`<SH> ${this.name} ${value}`);
    }

    public table(value: any): void {
        console.table(value);
    }

    public traceDump(value: any): void {
        this.trace(JSON.stringify(value));
    }
    public debugDump(value: any): void {
        this.debug(JSON.stringify(value));
    }
    public logDump(value: any): void {
        this.log(JSON.stringify(value));
    }
    public warnDump(value: any): void {
        this.warn(JSON.stringify(value));
    }
    public errorDump(value: any): void {
        this.error(JSON.stringify(value));
    }
}

/**
 * ソースに対して上書きを行う。
 * @param source 基にするデータ。
 * @param overwrite 上書きするデータ。
 * 
 * @returns source
 */
export function merge<T>(source: T, overwrite: T): T {
    if (!source) {
        return source;
    }
    if (!overwrite) {
        return source;
    }

    for (const key in overwrite) {
        if(overwrite[key]) {
            try {
                if (overwrite[key].constructor === Object) {
                    source[key] = merge(source[key], overwrite[key]);
                } else {
                    source[key] = overwrite[key];
                }
            } catch (e) {
                source[key] = overwrite[key];
            }
        }
    }

    return source;
}

export abstract class LoggingBase {

    protected readonly logger: Logger;

    protected constructor(name: string) {
        this.logger = new Logger(name);
    }

}

export abstract class ActionBase extends LoggingBase {
    protected constructor(name: string) {
        super(name);
    }

    public abstract initialize(): void;
}

