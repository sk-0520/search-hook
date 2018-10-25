import { IReadOnlyServiceManagerSetting, IServiceManagerSetting, ServiceManagerSetting } from "./service-manager-setting";
import { IReadOnlyNotItemSetting, INotItemSetting, NotItemSetting } from "./not-item-setting";
import { IReadOnlyHideItemSetting, IHideItemSetting, HideItemSetting } from "./hide-item-setting";


export interface IReadOnlyMainSetting {
    readonly service: IReadOnlyServiceManagerSetting;

    readonly notItems: ReadonlyArray<IReadOnlyNotItemSetting>;
    readonly hideItems: ReadonlyArray<IReadOnlyHideItemSetting>;
}

export interface IMainSetting extends IReadOnlyMainSetting {
    service: IServiceManagerSetting;

    notItems: Array<INotItemSetting>;
    hideItems: Array<IHideItemSetting>;
}

export class MainSetting implements IMainSetting {
    public service = new ServiceManagerSetting();

    public notItems = Array<NotItemSetting>();
    public hideItems = Array<HideItemSetting>();
}

