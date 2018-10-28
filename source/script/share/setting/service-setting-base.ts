
export interface IReadOnlyServiceSetting {
    readonly enabled: boolean;
}

export interface IServiceSetting extends IReadOnlyServiceSetting {
    enabled: boolean;
}

export class ServiceSettingBase implements IServiceSetting {
    public enabled = false;
}
