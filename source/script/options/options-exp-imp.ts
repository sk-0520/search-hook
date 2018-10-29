import { ActionBase } from "../share/common";
import { ElementId } from "../share/define/element-names";

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
    }

    private copy(): void {
    }

    private import(): void {
    }


}