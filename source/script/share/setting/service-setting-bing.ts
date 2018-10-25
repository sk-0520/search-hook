import { ServiceSettingBase, IReadOnlyServiceSetting } from "./service-setting-base";

export interface IReadOnlyBingServiceSetting extends IReadOnlyServiceSetting { }
export interface IBingServiceSetting extends IReadOnlyBingServiceSetting { }

export class BingServiceSetting extends ServiceSettingBase implements IBingServiceSetting { }
