import { ActionBase } from "../share/common";
import { ElementId } from "../share/define/element-names";
import { Setting } from "../browser/setting";
import { IMainSetting } from "../share/setting/main-setting";

export default class OptionsExportImport extends ActionBase  {

    constructor() {
        super('Options Export/Import');
    }

    private getTextArea(): HTMLTextAreaElement {
        return document.getElementById(ElementId.optionsInportExportExportArea) as HTMLTextAreaElement;
    }

    public initialize(): void {
        document.getElementById(ElementId.optionsInportExportExport)!.addEventListener(
            'click',
            e =>this.export()
        );
        document.getElementById(ElementId.optionsInportExportCopy)!.addEventListener(
            'click',
            e =>this.copy()
        );
        document.getElementById(ElementId.optionsInportExportImport)!.addEventListener(
            'click',
            e =>this.import()
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

    private import(): void {
        const textArea = this.getTextArea();
        try {
            const inputMainSetting = JSON.parse(textArea.value) as IMainSetting;
            this.logger.dumpLog(inputMainSetting);

            const setting = new Setting();
            const tunedMainSetting = setting.tuneMainSetting(inputMainSetting);
            this.logger.dumpLog(tunedMainSetting);

            setting.saveMainSettingAsync(tunedMainSetting, true);

        } catch(ex) {
            this.logger.error(ex);
            alert(ex);
        }
        
    }


}