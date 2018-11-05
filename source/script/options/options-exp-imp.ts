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
            e => this.exportAsync()
        );
        document.getElementById(ElementId.optionsInportExportCopy)!.addEventListener(
            'click',
            e => this.copy()
        );
        document.getElementById(ElementId.optionsInportExportImport)!.addEventListener(
            'click',
            e => this.importExport()
        );
    }

    private async exportAsync(): Promise<void> {
        const setting = new Setting();
        try {
            const baseSetting = await setting.loadMainSettingAsync();
            const mainSetting = setting.tuneMainSetting(baseSetting);
            this.getTextArea().value = JSON.stringify(mainSetting, undefined, 2);
        } catch (ex) {
            this.logger.dumpError(ex);
        }
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

    private async importExport(): Promise<void> {
        this.changeEnabledImport(false);
        const textArea = this.getTextArea();
        try {
            const inputMainSetting = JSON.parse(textArea.value) as IMainSetting;
            this.logger.dumpLog(inputMainSetting);

            const setting = new Setting();
            const tunedMainSetting = setting.tuneMainSetting(inputMainSetting);
            this.logger.dumpLog(tunedMainSetting);

            const getter = new DeliveryHideItemGetter();
            for (const item of tunedMainSetting.deliveryHideItems) {
                const result = await getter.getAsync(item.url);
                const checkedResult = getter.checkResult(result);
                if (!checkedResult.success) {
                    this.logger.error(checkedResult.message);
                    continue;
                }

                const data = getter.split(result!);
                const checkedData = getter.checkData(data);
                if (!checkedData.success) {
                    this.logger.error(checkedData.message);
                    continue;
                }
                await setting.mergeDeliverySettingAsync(data.header.url, splitLines(result!));
            }
            await setting.saveMainSettingAsync(tunedMainSetting, true);
        } catch (ex) {
            this.logger.error(ex);
            alert(ex);
            this.changeEnabledImport(true);
        }
    }
}
