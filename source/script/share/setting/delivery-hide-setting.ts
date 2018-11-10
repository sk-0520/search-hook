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
    website: string;
}

export interface IReadOnlyDeliveryHideSetting extends IReadOnlyDeliveryHideHeaderSetting {
    readonly url: string;
    readonly name: string;
    readonly version: string;
    readonly author: string;
    readonly website: string;
    readonly service: IReadOnlyServiceEnabledSetting;
}

export interface IDeliveryHideSetting extends IDeliveryHideHeaderSetting, IReadOnlyDeliveryHideSetting {
    url: string;
    name: string;
    version: string;
    author: string;
    website: string;
    service: IServiceEnabledSetting;
}

export class DeliveryHideSetting implements IDeliveryHideSetting {
    public url = '';
    public name = '';
    public version = '';
    public author = '';
    public website = '';
    public service = new ServiceEnabledSetting();
}
