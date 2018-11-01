import { ServiceKind, IService } from "../define/service-kind";
import { IReadOnlyHideItemSetting } from "../setting/hide-item-setting";

export interface IBridgeData { }

export abstract class BridgeData implements IBridgeData { }

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

export interface IHideItemsBridgeData extends IBridgeData {
    readonly enabled: boolean;
    readonly items: ReadonlyArray<IReadOnlyHideItemSetting>;
}

export class ItemsBridgeData extends BridgeData implements IHideItemsBridgeData {
    public readonly enabled: boolean;
    public readonly items: ReadonlyArray<IReadOnlyHideItemSetting>;

    constructor(enabled: boolean, items: ReadonlyArray<IReadOnlyHideItemSetting>) {
        super();
        this.enabled = enabled;
        this.items = items;
    }
}

export interface IEraseBridgeData extends IBridgeData {
    readonly enabled: boolean;
    readonly items: ReadonlyArray<string>;
}

export class EraseBridgeData extends BridgeData implements IEraseBridgeData {
    public readonly enabled: boolean;
    public readonly items: ReadonlyArray<string>;

    constructor(enabled: boolean, items: ReadonlyArray<string>) {
        super();
        this.enabled = enabled;
        this.items = items;
    }
}

export interface IHideRequestItem {
    /** 一意の DATA 属性 */
    dataAttribute: string,
    /** リンクの値 */
    linkValue: string,
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

    constructor(enabled: boolean, items: ReadonlyArray<IHideResponseItem>) {
        super();
        this.enabled = enabled;
        this.items = items;
    }
}
