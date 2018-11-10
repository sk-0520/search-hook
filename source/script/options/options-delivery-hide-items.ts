import { getDeliveryHideItemAsync } from "../browser/delivery-hide-item";
import { Setting } from "../browser/setting";
import { ElementId, ElementName, SelectorConverter } from "../share/define/element-names";
import { IDeliveryHideSetting } from "../share/setting/delivery-hide-setting";
import { ServiceEnabledSetting } from "../share/setting/service-enabled-setting";
import OptionsBase from "./options-base";

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

    public restore(setting: Array<IDeliveryHideSetting>): void {
        const parent = this.getParentElement();
        for (const item of setting) {
            this.addDeliveryHideItemCore(parent, item);
        }
    }

    public export(): Array<IDeliveryHideSetting> {
        const result = new Array<IDeliveryHideSetting>();
        const parentElement = this.getParentElement();
        const elements = parentElement.querySelectorAll(SelectorConverter.fromName(ElementName.optionsDeliveryHideItemGroup));

        for (const element of elements) {
            const rawSetting = this.getInputByName(element, ElementName.optionsDeliveryHideItemSetting).value;
            const setting = JSON.parse(rawSetting) as IDeliveryHideSetting;
            setting.service = new ServiceEnabledSetting();
            setting.service.google = this.getInputByName(element, ElementName.optionsDeliveryHideItemServiceGoogle).checked;
            setting.service.bing = this.getInputByName(element, ElementName.optionsDeliveryHideItemServiceBing).checked;

            result.push(setting);
        }

        return result;
    }

    private addDeliveryHideItem(setting: IDeliveryHideSetting) {
        const parent = this.getParentElement();
        this.addDeliveryHideItemCore(parent, setting);
    }
    private addDeliveryHideItemCore(parent: Element, item: IDeliveryHideSetting) {

        const templateElement = parent.querySelector("template")!;
        const clonedElement = document.importNode(templateElement.content, true);

        this.setByName(clonedElement, ElementName.optionsDeliveryHideItemRemove, elm => elm.addEventListener('click', e => {
            e.preventDefault();

            const itemGroupElement = e.srcElement!.closest(SelectorConverter.fromName(ElementName.optionsDeliveryHideItemGroup));
            itemGroupElement!.remove();
        }));

        this.setByName(clonedElement, ElementName.optionsDeliveryHideItemUpdate, elm => elm.addEventListener('click', async e => {
            e.preventDefault();

            const itemGroupElement = e.srcElement!.closest(SelectorConverter.fromName(ElementName.optionsDeliveryHideItemGroup))!;

            elm.disabled = true;
            try {
                const url = this.getInputByName(itemGroupElement!, ElementName.optionsDeliveryHideItemUrl).value;
                await this.importAsync(url);
            } finally {
                elm.disabled = false;
            }
        }));

        this.setDeliveryHideItem(clonedElement, item);

        parent.appendChild(clonedElement);
    }

    private setDeliveryHideItem(targetElement: Element | DocumentFragment, item: IDeliveryHideSetting): void {
        this.setByName(targetElement, ElementName.optionsDeliveryHideItemUrl, elm => elm.value = item.url);
        this.setByName(targetElement, ElementName.optionsDeliveryHideItemSetting, elm => elm.value = JSON.stringify(item));

        const nameElement = targetElement.querySelector(SelectorConverter.fromName(ElementName.optionsDeliveryHideItemName)) as HTMLElement;
        nameElement.textContent = item.name;

        const versionElement = targetElement.querySelector(SelectorConverter.fromName(ElementName.optionsDeliveryHideItemVersion)) as HTMLElement;
        versionElement.textContent = item.version;
        
        this.setByName(targetElement, ElementName.optionsDeliveryHideItemServiceGoogle, elm => elm.checked = item.service.google);
        this.setByName(targetElement, ElementName.optionsDeliveryHideItemServiceBing, elm => elm.checked = item.service.bing);
    }

    private changeEnabledImportCommand(isEnabled: boolean) {
        const element = this.getInputById(ElementId.optionsDeliveryHideItemRegisterImport);
        element.disabled = !isEnabled;
    }

    private async importFromUserInputAsync(e: MouseEvent): Promise<void> {
        e.preventDefault();

        const inputUrl = this.getInputById(ElementId.optionsDeliveryHideItemRegisterInputUrl).value;

        const url = inputUrl.trim();

        this.changeEnabledImportCommand(false);
        try {
            await this.importAsync(url);
        } finally {
            this.changeEnabledImportCommand(true);
        }
    }

    private getSettingElementByUrl(url: string): Element | null {
        const parentElement = this.getParentElement();
        const elements = parentElement.querySelectorAll(SelectorConverter.fromName(ElementName.optionsDeliveryHideItemGroup));
        for (const element of elements) {
            const urlValue = this.getInputByName(element, ElementName.optionsDeliveryHideItemUrl).value;
            if (url === urlValue) {
                return element;
            }
        }

        return null;
    }

    private async importAsync(url: string): Promise<boolean> {
        const result = await getDeliveryHideItemAsync(url);
        
        if (!result.success) {
            alert(result.message!);
            return false;
        }

        this.logger.dumpDebug('save: ' + result.content!);
        const  hideSetting = result.setting!;
        const targetElement = this.getSettingElementByUrl(hideSetting.url);
        if(targetElement) {
            this.setDeliveryHideItem(targetElement, hideSetting);
        } else {
            this.addDeliveryHideItem(hideSetting);
        }

        // データそのものは書き込んでおく
        const setting = new Setting();
        await setting.mergeDeliverySettingAsync(hideSetting.url, result.lines!);
        return true;
    }
}
