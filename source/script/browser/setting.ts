import { LoggingBase, merge } from "../share/common";
import { IMainSetting, MainSetting } from "../share/setting/main-setting";

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

            return (o.setting as any) as IMainSetting;
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

    public saveMainSettingAsync(mainSetting: IMainSetting, isReload: boolean): Promise<void> {
        return browser.storage.local.set({
            setting: mainSetting as any
        }).then(
            result => {
                browser.runtime.reload();
            },
            error => {
                this.logger.error(error);
            }
        );
    }
}
