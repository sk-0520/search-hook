import { ActionBase, splitLines } from "../share/common";
import { ElementId } from "../share/define/element-names";
import { Setting } from "../browser/setting";
import { IMainSetting } from "../share/setting/main-setting";
import { DeliveryHideItemGetter } from "../browser/delivery-hide-item";

export default class OptionsExportImport extends ActionBase {

    constructor() {
        super('Options Export/Import');
    }

    private getTextArea(): HTMLTextAreaElement {
        return document.getElementById(ElementId.optionsInportExportExportArea) as HTMLTextAreaElement;
    }

    public initialize(): void {
        document.getElementById(ElementId.optionsInportExportExport)!.addEventListener(
            'click',
            e => this.export()
        );
        document.getElementById(ElementId.optionsInportExportCopy)!.addEventListener(
            'click',
            e => this.copy()
        );
        document.getElementById(ElementId.optionsInportExportImport)!.addEventListener(
            'click',
            e => this.import()
        );
    }

    private export(): void {
        const setting = new Setting();
        setting.loadMainSettingAsync().then(
            s => {
                const mainSetting = setting.tuneMainSetting(s);
                this.getTextArea().value = JSON.stringify(mainSetting, undefined, 2);
            },
            error => this.logger.error(error)
        );
    }

    private copy(): void {
        const textArea = this.getTextArea();
        textArea.select();
        document.execCommand("copy");
    }

    private changeEnabledImport(isEnabled: boolean) {
        const element = document.getElementById(ElementId.optionsInportExportImport) as HTMLInputElement;
        element.disabled = !isEnabled;
    }

    private import(): void {
        this.changeEnabledImport(false);
        const textArea = this.getTextArea();
        try {
            const inputMainSetting = JSON.parse(textArea.value) as IMainSetting;
            this.logger.dumpLog(inputMainSetting);

            const setting = new Setting();
            const tunedMainSetting = setting.tuneMainSetting(inputMainSetting);
            this.logger.dumpLog(tunedMainSetting);

            const getter = new DeliveryHideItemGetter();
            Promise.all(tunedMainSetting.deliveryHideItems.map(i => {
                return getter.getAsync(i.url).then(result => {
                    const checkedResult = getter.checkResult(result);
                    if (!checkedResult.success) {
                        this.logger.error(checkedResult.message);
                        return Promise.resolve();
                    }

                    const data = getter.split(result!);
                    const checkedData = getter.checkData(data);
                    if (!checkedData.success) {
                        this.logger.error(checkedData.message);
                        return Promise.resolve();
                    }
                    return setting.mergeDeliverySettingAsync(data.header.url, splitLines(result!));
                });
            })).then(r => {
                setting.saveMainSettingAsync(tunedMainSetting, true);
            });
        } catch (ex) {
            this.logger.error(ex);
            alert(ex);
            this.changeEnabledImport(true);
        }
    }
}
