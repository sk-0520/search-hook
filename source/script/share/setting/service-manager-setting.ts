import { GoogleServiceSetting, IGoogleServiceSetting, IReadOnlyGoogleServiceSetting } from "./service-setting-google";
import { BingServiceSetting, IBingServiceSetting, IReadOnlyBingServiceSetting } from "./service-setting-bing";

export interface IReadOnlyServiceManagerSetting {
    readonly google: IReadOnlyGoogleServiceSetting;
    readonly bing: IReadOnlyBingServiceSetting;
}

export interface IServiceManagerSetting extends IReadOnlyServiceManagerSetting {
    google: IGoogleServiceSetting;
    bing: IBingServiceSetting;
}

export class ServiceManagerSetting {
    public google = new GoogleServiceSetting();
    public bing = new BingServiceSetting();
}



