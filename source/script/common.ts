// contents script, background script 共有

export enum ServiceKind {
    google = 'google',
    bing = 'bing',
}

export class Logger {
    constructor(name: string) {
        this.name = name;
    }

    public readonly name: string;

    public log(value:string): void {
        console.log(`<OP-S> ${name} ${value}`);
    }
    public debug(value:string): void {
        console.debug(`<OP-S> ${name} ${value}`);
    }
    public error(value:string): void {
        console.error(`<OP-S> ${name} ${value}`);
    }
}

/**
 * ソースに対して上書きを行う。
 * @param source 
 * @param overwrite 
 */
export function merge<T>(source:T, overwrite: T):T {
    if(!source) {
        return source;
    }
    if(!overwrite) {
        return source;
    }

    for (var key in overwrite) {
        try {
            if(overwrite[key].constructor == Object ) {
                source[key] = merge(source[key], overwrite[key]);
            } else {
                source[key] = overwrite[key];
            }
        } catch(e) {
            source[key] = overwrite[key];
        }
    }

    return source;
}