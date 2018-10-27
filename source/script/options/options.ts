import { Setting } from '../browser/setting';
import { ActionBase } from '../share/common';
import { convertMatchKind } from '../share/define/match-kind';
import { HideItemSetting } from '../share/setting/hide-item-setting';
import { IMainSetting, MainSetting } from '../share/setting/main-setting';
import OptionsNotItems from './options-not-items';
import OptionsService from './options-service';
import OptionsHideItems from './options-hide-items';

export default class Options extends ActionBase {

    private optionsService = new OptionsService();
    private optionsNotItems = new OptionsNotItems();
    private optionsHideItems = new OptionsHideItems();

    constructor() {
        super('Options');
    }

    public initialize() {
        document.querySelector('form')!.addEventListener('submit', e => this.save(e));

        this.optionsService.initialize();
        this.optionsNotItems.initialize();
        this.optionsHideItems.initialize();

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
    }

    private save(e: Event): void {
        e.preventDefault();

        const setting = new MainSetting();
        setting.service = this.optionsService.export();
        setting.notItems = this.optionsNotItems.export();
        setting.hideItems = this.optionsHideItems.export();

        browser.storage.local.set({
            setting: setting as any
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
