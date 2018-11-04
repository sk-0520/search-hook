import { Setting } from '../browser/setting';
import { ActionBase } from '../share/common';
import { IMainSetting, MainSetting } from '../share/setting/main-setting';
import OptionsNotItems from './options-not-items';
import OptionsService from './options-service';
import OptionsHideItems from './options-hide-items';
import { Locale } from '../share/locale';
import OptionsExportImport from './options-exp-imp';
import OptionsDeliveryHideItems from './options-delivery-hide-items';

export default class Options extends ActionBase {

    private optionsService = new OptionsService();
    private optionsNotItems = new OptionsNotItems();
    private optionsHideItems = new OptionsHideItems();
    private optionsDeliveryHideItems = new OptionsDeliveryHideItems();

    private optionsExpImp = new OptionsExportImport();

    private locale = new Locale();

    constructor() {
        super('Options');
    }

    public initialize() {
        document.querySelector('form')!.addEventListener('submit', e => this.save(e));

        this.optionsService.initialize();
        this.optionsNotItems.initialize();
        this.optionsHideItems.initialize();
        this.optionsDeliveryHideItems.initialize();

        this.optionsExpImp.initialize();

        this.locale.attachLocaleRoot();

        this.restore();
    }

    private restore(): void {
        const setting = new Setting();
        setting.loadMainSettingAsync().then(
            result => this.restoreCore(setting.tuneMainSetting(result)),
            error => this.logger.dumpError(error)
        );
    }

    private restoreCore(setting: IMainSetting) {
        this.optionsService.restore(setting.service);
        this.optionsNotItems.restore(setting.notItems);
        this.optionsHideItems.restore(setting.hideItems);
        this.optionsDeliveryHideItems.restore(setting.deliveryHideItems);
    }

    private save(e: Event): void {
        e.preventDefault();

        const mainSetting = new MainSetting();
        mainSetting.service = this.optionsService.export();
        mainSetting.notItems = this.optionsNotItems.export();
        mainSetting.hideItems = this.optionsHideItems.export();
        mainSetting.deliveryHideItems = this.optionsDeliveryHideItems.export();

        const setting = new Setting();
        setting.saveMainSettingAsync(mainSetting, true);
    }

}
