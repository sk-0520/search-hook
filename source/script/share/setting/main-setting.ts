import { HideItemSetting, IHideItemSetting, IReadOnlyHideItemSetting } from "./hide-item-setting";
import { INotItemSetting, IReadOnlyNotItemSetting, NotItemSetting } from "./not-item-setting";
import { IReadOnlyServiceManagerSetting, IServiceManagerSetting, ServiceManagerSetting } from "./service-manager-setting";
import { IReadOnlyDeliveryHideSetting, IDeliveryHideSetting, DeliveryHideSetting } from "./delivery-hide-setting";
import { IWhitelistItemSetting, IReadOnlyWhitelistItemSetting, WhitelistItemSetting } from "./whitelist-item-setting";


export interface IReadOnlyMainSetting {
    readonly service: IReadOnlyServiceManagerSetting;

    readonly notItems: ReadonlyArray<IReadOnlyNotItemSetting>;
    readonly hideItems: ReadonlyArray<IReadOnlyHideItemSetting>;

    readonly deliveryHideItems: ReadonlyArray<IReadOnlyDeliveryHideSetting>;

    readonly whitelistItems: ReadonlyArray<IReadOnlyWhitelistItemSetting>;
}

export interface IMainSetting extends IReadOnlyMainSetting {
    service: IServiceManagerSetting;

    notItems: Array<INotItemSetting>;
    hideItems: Array<IHideItemSetting>;

    deliveryHideItems: Array<IDeliveryHideSetting>;

    whitelistItems: Array<IWhitelistItemSetting>;
}

export class MainSetting implements IMainSetting {
    public service = new ServiceManagerSetting();

    public notItems = new Array<NotItemSetting>();
    public hideItems = new Array<HideItemSetting>();

    public deliveryHideItems = new Array<DeliveryHideSetting>();

    public whitelistItems = new Array<WhitelistItemSetting>();

}
