import { LoggingBase, merge } from "../share/common";
import { IMainSetting, MainSetting } from "../share/setting/main-setting";
import { IDeliverySetting, DeliverySetting } from "../share/setting/delivery-setting";

export class Setting extends LoggingBase {

    constructor() {
        super('Setting');
    }

    private loadAsync<TSetting>(storageKey: string): Promise<TSetting | null> {
        const getting = browser.storage.local.get(storageKey);
        return getting.then(o => {
            this.logger.error('storageKey:' + storageKey);
            this.logger.dumpError(o);
            if (!o || !o[storageKey]) {
                return null;
            }

            return (o[storageKey] as any) as TSetting;
        });
    }

    public loadMainSettingAsync(): Promise<IMainSetting | null> {
        return this.loadAsync<IMainSetting>('setting');
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
        return this.loadAsync<IDeliverySetting>('delivery');
    }

    public tuneDeliverySetting(setting: IDeliverySetting | null): DeliverySetting {
        let baseSetting = new DeliverySetting();

        if (setting) {
            baseSetting = merge(baseSetting, setting);
        }

        this.logger.dumpDebug(baseSetting);

        return baseSetting;
    }

    private saveDeliverySettingAsync(deliverySetting: IDeliverySetting): Promise<void> {
        this.logger.warn(('????????????????????'));
        this.logger.dumpError(deliverySetting);
        return browser.storage.local.set({
            delivery: deliverySetting as any
        });
    }

    public mergeDeliverySettingAsync(key: string, lines: ReadonlyArray<string>): Promise<void> {
        return this.loadDeliverySettingAsync().then(result => {
            const setting = this.tuneDeliverySetting(result);
            this.logger.warn(('@@@@@@@@@@@@@@(' + key + ')'));
            this.logger.dumpWarn(setting);
            setting.hideItems[key] = lines as Array<string>;
            this.logger.dumpWarn(setting);
            return this.saveDeliverySettingAsync(setting);
            // tslint:disable-next-line
        }).then(r => { });
    }

    public deleteDeliverySettingAsync(key: string): Promise<boolean> {
        // async使わな何がなんだか
        return this.loadDeliverySettingAsync().then(result => {
            const setting = this.tuneDeliverySetting(result);
            const success = key in setting.hideItems;
            if (success) {
                delete setting.hideItems[key];
                return this.saveDeliverySettingAsync(setting).then(r => success);
            }
            return Promise.resolve(Promise.resolve(false));
        }).then(r => r);
    }

}
