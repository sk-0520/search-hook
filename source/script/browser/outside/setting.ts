import { LoggingBase, merge } from "../../share/common";
import { IMainSetting, MainSetting } from "../../share/setting/main-setting";

export class Setting extends LoggingBase {

    constructor() {
        super('Setting');
    }

    public loadMainSettingAsync(): Promise<IMainSetting | null> {
        const getting = browser.storage.local.get('setting');
        return getting.then(o => {
            if (!o || !o.setting) {
                return null;
            }

            return (<any>o.setting) as IMainSetting;
        });
    }

    public tuneMainSetting(setting: IMainSetting | null): MainSetting {
        let baseSetting = new MainSetting();

        if (setting) {
            baseSetting = merge(baseSetting, setting);
        }

        this.logger.dumpDebug(baseSetting);

        return baseSetting;
    }

}
