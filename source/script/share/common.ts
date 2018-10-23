import * as conf from "../conf";

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

    public trace(value:string): void {
        console.trace(`<SH> ${this.name} ${value}`);
    }
    public debug(value:string): void {
        console.debug(`<SH> ${this.name} ${value}`);
    }
    public log(value:string): void {
        console.log(`<SH> ${this.name} ${value}`);
    }
    public warn(value:string): void {
        console.warn(`<SH> ${this.name} ${value}`);
    }
    public error(value:string): void {
        console.error(`<SH> ${this.name} ${value}`);
    }

    public table(value: any): void {
        console.table(value);
    }

    public traceJson(value:any): void {
        this.trace(JSON.stringify(value));
    }
    public debugJson(value:any): void {
        this.debug(JSON.stringify(value));
    }
    public logJson(value:any): void {
        this.log(JSON.stringify(value));
    }
    public warnJson(value:any): void {
        this.warn(JSON.stringify(value));
    }
    public errorJson(value:any): void {
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

export abstract class LoggingBase {

    protected constructor(name: string) {
        this.logger = new Logger(name);
    }

    protected readonly logger:Logger;

}

export abstract class ActionBase extends LoggingBase {
    protected constructor(name: string) {
        super(name);
    }


    public abstract initialize(): void;
}







export enum BridgeMeesageKind {
    service,
    items,
    erase,
}

export abstract class BridgeMeesageBase {
    constructor(kind: BridgeMeesageKind) {
        this.kind = kind;
    }

    public readonly kind: BridgeMeesageKind;
}

export class BridgeMeesage<T extends BridgeDataBase> extends BridgeMeesageBase {
    constructor(kind:BridgeMeesageKind, data: T) {
        super(kind);
        this.data = data;
    }

    public readonly data: T;
}

export abstract class BridgeDataBase { }

export class ServiceBridgeData {
    constructor(service: ServiceKind) {
        this.service = service;
    }

    public readonly service: ServiceKind;
}

export class ItemsBridgeData {
    constructor(enabled:boolean, items:Array<conf.HiddenItemSetting>) {
        this.enabled = enabled;
        this.items = items;
    }
    
    public readonly enabled: boolean;
    public readonly items: Array<conf.HiddenItemSetting>;
}

export class EraseBridgeData {
    constructor(enabled:boolean, items:Array<string>) {
        this.enabled = enabled;
        this.items = items;
    }
    
    public readonly enabled: boolean;
    public readonly items: Array<string>;
}