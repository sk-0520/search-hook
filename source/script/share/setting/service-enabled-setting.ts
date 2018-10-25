

export interface IReadOnlyServiceEnabledSetting {
    readonly google: boolean;
    readonly bing: boolean;
}

export interface IServiceEnabledSetting extends IReadOnlyServiceEnabledSetting {
    google: boolean;
    bing: boolean;
}

export class ServiceEnabledSetting implements IServiceEnabledSetting {
    public google = false;
    public bing = false;
}
