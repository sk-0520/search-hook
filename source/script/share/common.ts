import { Logger, ILogger } from "./logger";

// contents script, background script 共有

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
        if (key in overwrite) {
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

    private readonly loggerEntity: Logger;
    
    protected get logger(): ILogger {
        return this.loggerEntity;
    }

    protected constructor(name: string) {
        this.loggerEntity = new Logger(name);
    }

}

export abstract class ActionBase extends LoggingBase {
    protected constructor(name: string) {
        super(name);
    }

    public abstract initialize(): void;
}

export interface IException {
    readonly error: any;
}

export class Exception {
    public readonly error: any;

    constructor(error: any) {
        this.error = error;
    }
}

export function isNullOrEmpty(s: string|null|undefined): boolean {
    return !(s && s !== '');
}

