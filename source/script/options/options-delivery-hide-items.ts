import { IDeliveryHideSetting } from "../share/setting/delivery-hide-setting";
import OptionsBase from "./options-base";
import { ElementId } from "../share/define/element-names";
import { DeliveryHideItemGetter } from "../browser/delivery-hide-item";
import { isNullOrEmpty } from "../share/common";

export default class OptionsDeliveryHideItems extends OptionsBase<Array<IDeliveryHideSetting>> {

    constructor() {
        super('Options Delivery HideItems');
    }

    protected getParentElement(): Element {
        return document.getElementById(ElementId.optionsDeliveryHideItemList) as HTMLTextAreaElement;
    }

    public initialize(): void {
        this.getInputById(ElementId.optionsDeliveryHideItemRegisterImport).addEventListener(
            'click',
            e => this.importFromUserInputAsync(e)
        );
    }

    public restore(setting: IDeliveryHideSetting[]): void {
        //throw new Error("Method not implemented.");
    }
    
    public export(): IDeliveryHideSetting[] {
        throw new Error("Method not implemented.");
    }

    private changeEnabledImport(isEnabled: boolean) {
        const element = this.getInputById(ElementId.optionsDeliveryHideItemRegisterImport);
        element.disabled = !isEnabled;
    }

    private importFromUserInputAsync(e: MouseEvent): Promise<void> {
        e.preventDefault();

        const inputUrl = this.getInputById(ElementId.optionsDeliveryHideItemRegisterInputUrl).value;

        const url = inputUrl.trim();

        this.changeEnabledImport(false);
        return this.importAsync(url).then(
            () => this.changeEnabledImport(true)
        ).catch(
            ex => this.changeEnabledImport(true)
        );
    }

    private importAsync(url: string): Promise<void> {
        const getter = new DeliveryHideItemGetter();
        return getter.getAsync(url).then(
            result => {
                if(isNullOrEmpty(result)) {
                    alert('error');
                    return;
                }

                const data = getter.split(result!);
                alert(JSON.stringify(data));
            }
        );
    }
}
