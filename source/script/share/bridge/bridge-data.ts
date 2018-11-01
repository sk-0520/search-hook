import { ServiceKind, IService } from "../define/service-kind";

export interface IBridgeData extends IService {
    readonly service: ServiceKind;
}

export class BridgeData implements IBridgeData {
    readonly service: ServiceKind;

    constructor(service: ServiceKind) {
        this.service = service;
    }
}

export interface INotWordResponseBridgeData extends IBridgeData {
    readonly enabled: boolean;
    readonly items: ReadonlyArray<string>;
}

export class NotWordResponseBridgeData extends BridgeData implements INotWordResponseBridgeData {
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
    dataValue: string,
    /** リンクの値 */
    linkValue: string,
}

export interface IHideRequestBridgeData extends IBridgeData {
    readonly items: ReadonlyArray<IHideRequestItem>;
}

export class HideRequestBridgeData extends BridgeData implements IHideRequestBridgeData {
    public readonly items: ReadonlyArray<IHideRequestItem>;

    constructor(service: ServiceKind, items: ReadonlyArray<IHideRequestItem>) {
        super(service);
        this.items = items;
    }
}

export interface IHideResponseItem {
    /** 要求 */
    readonly request: IHideRequestItem,
    /** 非表示項目 */
    readonly hideTarget: boolean,
}

export interface IHideResponseBridgeData extends IBridgeData {
     readonly enabled: boolean;
    readonly items: ReadonlyArray<IHideResponseItem>;
}

export class HideResponseBridgeData extends BridgeData implements IHideResponseBridgeData {
    public readonly enabled: boolean;
    public readonly items: ReadonlyArray<IHideResponseItem>;

    constructor(service: ServiceKind, enabled: boolean, items: ReadonlyArray<IHideResponseItem>) {
        super(service);
        this.enabled = enabled;
        this.items = items;
    }
}
