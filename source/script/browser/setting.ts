import { LoggingBase, merge } from "../share/common";
import { IMainSetting, MainSetting } from "../share/setting/main-setting";
import { IDeliverySetting, DeliverySetting } from "../share/setting/delivery-setting";

export class Setting extends LoggingBase {

    constructor() {
        super('Setting');
    }

    private loadAsync<TSetting>(storageKey: string, objectKey: string): Promise<TSetting | null> {
        const getting = browser.storage.local.get(storageKey);
        return getting.then(o => {
            if (!o || !o[storageKey]) {
                return null;
            }

            return (o[storageKey] as any) as TSetting;
        });
    }

    public loadMainSettingAsync(): Promise<IMainSetting | null> {
        return this.loadAsync<IMainSetting>('setting', 'setting');
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

    public loadDeliverySettingAsync(): Promise<IDeliverySetting | null> {
        return this.loadAsync<IDeliverySetting>('delivery', 'setting');
    }

    public tuneDeliverySetting(setting: IDeliverySetting | null): DeliverySetting {
        let baseSetting = new DeliverySetting();

        if (setting) {
            baseSetting = merge(baseSetting, setting);
        }

        this.logger.dumpDebug(baseSetting);

        return baseSetting;
    }
}
