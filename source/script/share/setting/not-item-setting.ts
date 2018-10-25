import { ServiceEnabledSetting, IReadOnlyServiceEnabledSetting, IServiceEnabledSetting } from "./service-enabled-setting";

export interface IReadOnlyNotItemSetting {
    readonly word: string;
    readonly service: IReadOnlyServiceEnabledSetting;
}

export interface INotItemSetting extends IReadOnlyNotItemSetting {
    word: string;
    service: IServiceEnabledSetting;
}

export class NotItemSetting implements INotItemSetting {
    public word = '';
    public service = new ServiceEnabledSetting();
}
