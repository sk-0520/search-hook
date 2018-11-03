import { HideItemSetting, IHideItemSetting, IReadOnlyHideItemSetting } from "./hide-item-setting";
import { INotItemSetting, IReadOnlyNotItemSetting, NotItemSetting } from "./not-item-setting";
import { IReadOnlyServiceManagerSetting, IServiceManagerSetting, ServiceManagerSetting } from "./service-manager-setting";
import { IReadOnlyDeliveryHideSetting, IDeliveryHideSetting, DeliveryHideSetting } from "./delivery-hide-setting";


export interface IReadOnlyMainSetting {
    readonly service: IReadOnlyServiceManagerSetting;

    readonly notItems: ReadonlyArray<IReadOnlyNotItemSetting>;
    readonly hideItems: ReadonlyArray<IReadOnlyHideItemSetting>;

    readonly deliveryHideItems: ReadonlyArray<IReadOnlyDeliveryHideSetting>;
}

export interface IMainSetting extends IReadOnlyMainSetting {
    service: IServiceManagerSetting;

    notItems: Array<INotItemSetting>;
    hideItems: Array<IHideItemSetting>;

    deliveryHideItems: Array<IDeliveryHideSetting>;
}

export class MainSetting implements IMainSetting {
    public service = new ServiceManagerSetting();

    public notItems = Array<NotItemSetting>();
    public hideItems = Array<HideItemSetting>();

    public deliveryHideItems = Array<DeliveryHideSetting>();
}
