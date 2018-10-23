import * as conf from "./conf";

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
        console.log(`<OP-S> ${this.name} ${value}`);
    }
    public debug(value:string): void {
        console.debug(`<OP-S> ${this.name} ${value}`);
    }
    public error(value:string): void {
        console.error(`<OP-S> ${this.name} ${value}`);
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







export function splitQuery(service: ServiceKind, query: string) {
    if(!query) {
        return [];
    }

    var nowDq = false;

    var buffer = '';
    var result = [];

    for(var i = 0; i < query.length; i++) {
        var c = query.charAt(i);
        if(nowDq) {
            if(c == '"') {
                if(buffer.length) {
                    result.push(buffer);
                    buffer = '';
                    nowDq = false;
                }
            } else {
                buffer += c;
            }
        } else if(c == ' ') {
            if(buffer.length) {
                result.push(buffer);
                buffer = '';
            }
        } else if(c == '"') {
            nowDq = true;
        } else {
            buffer += c;
        }
    }

    if(buffer.length) {
        result.push(buffer);
    }

    return result;
}

const outputGoogle = new Logger('TEMP SHARED');

export function makeCustomQuery(service: ServiceKind, queryItems: Array<string>, notItems: Array<string>) {
    // 既に存在する否定ワードはそのまま、設定されていなければ追加していく

    var addNotItems = notItems.concat();
    var customQuery = [];
    for(var i = 0; i < queryItems.length; i++) {
        var query = queryItems[i];

        if(!query.length) {
            continue;
        }

        //<JS>if(query.charAt('-')) {
        if(query.charAt(0) == '-') {
            var notWord = query.substr(1);
            var index = addNotItems.indexOf(notWord);
            customQuery.push(query);
            if(index !== -1) {
                addNotItems.splice(index, 1);
            }
        } else {
            customQuery.push(query);
        }
    }

    outputGoogle.debug('notItems: ' + notItems);
    outputGoogle.debug('addNotItems: ' + addNotItems);

    for(var i = 0; i < addNotItems.length; i++) {
        var word = addNotItems[i];
        addNotItems[i] = '-' + word;
    }

    return {
        users: customQuery,
        applications: addNotItems
    };
}

export function getUserInputQuery(service: ServiceKind, queryItems: Array<string>, notItems: Array<string>) {
    // 否定ワードを除外
    var addNotItems = notItems.concat();
    var userQuerys = [];
    for(var i = 0; i < queryItems.length; i++) {
        var query = queryItems[i];

        if(!query.length) {
            continue;
        }

        //<JS>if(query.charAt('-')) {
        if(query.charAt(0) == '-') {
                var notWord = query.substr(1);
            var index = addNotItems.indexOf(notWord);
            if(index !== -1) {
                addNotItems.splice(index, 1);
            } else {
                userQuerys.push(query);
            }
        } else {
            userQuerys.push(query);
        }
    }

    return userQuerys;
}

export function toQueryString(service: ServiceKind, queryItems: Array<string>) {
    var items = queryItems.filter(function(s) {
        return s && s.length;
    }).map(function(s) {
        if(s.indexOf(' ') !== -1) {
            if(s.charAt(0) === '-') {
                return '-"' + s.substr(1) + '"';
            }

            return '"' + s + '"';
        } else {
            return s;
        }
    });

    return items.join(' ');
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