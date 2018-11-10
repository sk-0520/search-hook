import { LoggingBase, merge } from "../share/common";
import { IMainSetting, MainSetting } from "../share/setting/main-setting";
import { IDeliverySetting, DeliverySetting } from "../share/setting/delivery-setting";

export class Setting extends LoggingBase {

    constructor() {
        super('Setting');
    }

    private async loadAsync<TSetting>(storageKey: string): Promise<TSetting | null> {
        const raw = await browser.storage.local.get(storageKey);
        if (!raw || !(storageKey in raw)) {
            return null;
        }

        return (raw[storageKey] as any) as TSetting;
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

    public async saveMainSettingAsync(mainSetting: IMainSetting, isReload: boolean): Promise<void> {
        try {
            const deliverySetting = await this.loadDeliverySettingAsync();
            if(deliverySetting) {
                // 本体設定と紐づく外部設定のみを生かす(要はゴミ掃除)
                const newDeliverySetting = new DeliverySetting();
                // 非表示設定
                for(const item of mainSetting.deliveryHideItems) {
                    if(item.url in deliverySetting.hideItems) {
                        newDeliverySetting.hideItems[item.url] = deliverySetting.hideItems[item.url];
                    }
                }
                await this.saveDeliverySettingAsync(newDeliverySetting);
            }
            
            await browser.storage.local.set({
                setting: mainSetting as any
            });

            if (isReload) {
                browser.runtime.reload();
            }
        } catch (ex) {
            this.logger.dumpError(ex);
        }
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
        return browser.storage.local.set({
            delivery: deliverySetting as any
        });
    }

    public async mergeDeliverySettingAsync(key: string, lines: ReadonlyArray<string>): Promise<void> {
        const result = await this.loadDeliverySettingAsync();

        const setting = this.tuneDeliverySetting(result);
        setting.hideItems[key] = lines as Array<string>;
        return this.saveDeliverySettingAsync(setting);
    }

    public async deleteDeliverySettingAsync(key: string): Promise<boolean> {
        const result = await this.loadDeliverySettingAsync();

        // async使わな何がなんだか
        const setting = this.tuneDeliverySetting(result);
        const success = key in setting.hideItems;
        if (success) {
            delete setting.hideItems[key];
            await this.saveDeliverySettingAsync(setting);
            return success;
        }

        return false;
    }

}
