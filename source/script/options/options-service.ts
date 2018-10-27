import OptionsBase from "./options-base";
import { IServiceManagerSetting, ServiceManagerSetting } from "../share/setting/service-manager-setting";
import { IReadOnlyGoogleServiceSetting, GoogleServiceSetting } from "../share/setting/service-setting-google";
import { IReadOnlyBingServiceSetting, BingServiceSetting } from "../share/setting/service-setting-bing";
import { ElementId } from "../share/define/element-names";

export default class OptionsService extends OptionsBase<IServiceManagerSetting> {

    constructor() {
        super('Options Service');
    }

    protected getParentElement(): Element {
        return document.getElementById(ElementId.optionsService)!;
    }

    public initialize() {
        if(false) { 
            this.logger.debug('block is empty');
        }
    }

    private restoreGoogle(setting: IReadOnlyGoogleServiceSetting): void {
        this.setById(ElementId.optionsServiceGoogle, e => e.checked = setting.enabled);
        this.setById(ElementId.optionsServiceGoogleSearchCount, e => e.value = String(setting.searchCount));
        this.setById(ElementId.optionsServiceGoogleSearchSafe, e => e.checked = setting.searchSafe);
    }

    private restoreBing(setting: IReadOnlyBingServiceSetting): void {
        this.setById(ElementId.optionsServiceBing, e => e.checked = setting.enabled);
    }

    public restore(setting: IServiceManagerSetting) {
        this.restoreGoogle(setting.google);
        this.restoreBing(setting.bing);
    }

    private exportGoogle(): GoogleServiceSetting {
        const setting = new GoogleServiceSetting();

        setting.enabled = this.getInputById(ElementId.optionsServiceGoogle).checked;
        setting.searchCount = +this.getInputById(ElementId.optionsServiceGoogleSearchCount).value;
        setting.searchSafe = this.getInputById(ElementId.optionsServiceGoogleSearchSafe).checked;

        return setting;
    }

    private exportBing(): BingServiceSetting {
        const setting = new BingServiceSetting();

        setting.enabled = this.getInputById(ElementId.optionsServiceBing).checked;

        return setting;
    }

    public export(): IServiceManagerSetting {
        const setting = new ServiceManagerSetting();
        setting.google = this.exportGoogle();
        setting.bing = this.exportBing();

        return setting;
    }
}
