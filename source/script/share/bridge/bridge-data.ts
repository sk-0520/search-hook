import { ServiceKind } from "../define/service-kind";
import { IReadOnlyHideItemSetting } from "../setting/hide-item-setting";

export interface IBridgeData { }

export abstract class BridgeData implements IBridgeData { }

export interface IServiceBridgeData extends IBridgeData {
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