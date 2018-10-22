
export interface IMainSetting{
    service : ServiceSetting;

    notItems :Array<NotItemSetting>;
    hideItems : Array<HiddenItemSetting>;
}

export class MainSetting implements IMainSetting {
    public service = new ServiceSetting();

    public notItems = Array<NotItemSetting>();
    public hideItems = Array<HiddenItemSetting>();
}

export class ServiceSetting {
    public google = new GoogleServiceSetting();
    public bing = new BingServiceSetting();
}

export class ServiceSettingBase {
    public enabled = false;
}
export class GoogleServiceSetting extends ServiceSettingBase {
    public searchCount = 10;
    public searchSafe = false;
}
export class BingServiceSetting extends ServiceSettingBase { }

export class EnabledService {
    public google: boolean = false;
    public bing: boolean = false;
}

export enum MatchKind {
    partial = 'partial',
    forward = 'forward',
    perfect = 'perfect',
    regex = 'regex',
}

export function convertMatchKind(key:string): MatchKind {
    switch(key.toLowerCase()) {
        case  MatchKind.partial:
            return MatchKind.partial;

        case  MatchKind.perfect:
            return MatchKind.perfect;

        case  MatchKind.regex:
            return MatchKind.regex;

        default:
            throw { "error": key };
    }
}

export class MatchSetting {
    public kind = MatchKind.partial;
    /**
     * 大文字小文字を区別するか。
     */
    public case = false;
}

export class NotItemSetting {
    public word = '';
    public service= new EnabledService();
}

export class HiddenItemSetting {
    public word = '';
    public match = new MatchSetting();
    public service = new EnabledService();
}
