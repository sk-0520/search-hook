import { IReadOnlyServiceEnabledSetting, ServiceEnabledSetting, IServiceEnabledSetting } from "./service-enabled-setting";

export interface IReadOnlyDeliveryHideHeaderSetting {
    readonly url: string;
    readonly name: string;
    readonly version: string;
    readonly author: string;
}

export interface IDeliveryHideHeaderSetting extends IReadOnlyDeliveryHideHeaderSetting {
    url: string;
    name: string;
    version: string;
    author: string;
}

export interface IReadOnlyDeliveryHideSetting extends IReadOnlyDeliveryHideHeaderSetting {
    readonly url: string;
    readonly name: string;
    readonly version: string;
    readonly author: string;
    readonly service: IReadOnlyServiceEnabledSetting;
}

export interface IDeliveryHideSetting extends IDeliveryHideHeaderSetting, IReadOnlyDeliveryHideSetting {
    url: string;
    name: string;
    version: string;
    author: string;
    service: IServiceEnabledSetting;
}

export class DeliveryHideSetting implements IDeliveryHideSetting {
    public url = '';
    public name = '';
    public version = '';
    public author = '';
    public service = new ServiceEnabledSetting();
}
