import { ServiceSettingBase, IReadOnlyServiceSetting } from "./service-setting-base";

export interface IReadOnlyGoogleServiceSetting extends IReadOnlyServiceSetting {
    readonly searchCount: number;
    readonly searchSafe: boolean;
}

export interface IGoogleServiceSetting extends IReadOnlyGoogleServiceSetting {
    searchCount: number;
    searchSafe: boolean;
}

export class GoogleServiceSetting extends ServiceSettingBase implements IGoogleServiceSetting {
    public searchCount = 10;
    public searchSafe = false;
}

