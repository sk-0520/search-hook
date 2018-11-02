import { ServiceKind, IService } from "../define/service-kind";
import { LogKind } from "../logger";

export interface IBridgeData { }

export class BridgeData implements IBridgeData { }

export interface IServiceBridgeData extends IBridgeData, IService {
    readonly service: ServiceKind;
}

export class ServiceBridgeData extends BridgeData implements IServiceBridgeData {
    public readonly service: ServiceKind;

    constructor(service: ServiceKind) {
        super();
        this.service = service;
    }
}

export interface INotWordResponseBridgeData extends IServiceBridgeData {
    readonly enabled: boolean;
    readonly items: ReadonlyArray<string>;
}

export class NotWordResponseBridgeData extends ServiceBridgeData implements INotWordResponseBridgeData {
    public readonly enabled: boolean;
    public readonly items: ReadonlyArray<string>;

    constructor(service: ServiceKind, enabled: boolean, items: ReadonlyArray<string>) {
        super(service);
        this.enabled = enabled;
        this.items = items;
    }
}

export interface IHideRequestItem {
    /** 一意の DATA 属性 */
    dataValue: string;
    /** リンクの値 */
    linkValue: string;
}

export interface IHideRequestBridgeData extends IServiceBridgeData {
    readonly items: ReadonlyArray<IHideRequestItem>;
}

export class HideRequestBridgeData extends ServiceBridgeData implements IHideRequestBridgeData {
    public readonly items: ReadonlyArray<IHideRequestItem>;

    constructor(service: ServiceKind, items: ReadonlyArray<IHideRequestItem>) {
        super(service);
        this.items = items;
    }
}

export interface IHideResponseItem {
    /** 要求 */
    readonly request: IHideRequestItem;
    /** 非表示項目 */
    readonly hideTarget: boolean;
}

export interface IHideResponseBridgeData extends IServiceBridgeData {
    readonly enabled: boolean;
    readonly items: ReadonlyArray<IHideResponseItem>;
}

export class HideResponseBridgeData extends ServiceBridgeData implements IHideResponseBridgeData {
    public readonly enabled: boolean;
    public readonly items: ReadonlyArray<IHideResponseItem>;

    constructor(service: ServiceKind, enabled: boolean, items: ReadonlyArray<IHideResponseItem>) {
        super(service);
        this.enabled = enabled;
        this.items = items;
    }
}

export interface IOutputLogBridgeData extends IBridgeData {
    readonly name: string;
    readonly isText: boolean;
    readonly message: string;
    readonly logKind: LogKind;
}

export class OutputLogBridgeData extends BridgeData implements IOutputLogBridgeData {
    public readonly name: string;
    /** message が文字列かどうか。送受信で文字列になるし送信時に文字列にしてるしあんまり意味ないというか使ってないパラメータ */
    public readonly isText: boolean;
    public readonly message: string;
    public readonly logKind: LogKind;

    constructor(name: string, isText: boolean, message: string, logKind: LogKind) {
        super();
        this.name = name;
        this.isText = isText;
        this.message = message;
        this.logKind = logKind;
    }
}
