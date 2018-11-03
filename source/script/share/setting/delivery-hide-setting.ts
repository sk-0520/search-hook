import { IReadOnlyServiceEnabledSetting, ServiceEnabledSetting, IServiceEnabledSetting } from "./service-enabled-setting";

export interface IReadOnlyDeliveryHideSetting {
    readonly url: string;
    readonly name: string;
    readonly version: string;
    readonly author: string;
    readonly service: IReadOnlyServiceEnabledSetting;
}

export interface IDeliveryHideSetting extends IReadOnlyDeliveryHideSetting {
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
