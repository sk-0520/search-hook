import { DeliveryHideItemGetter } from "../browser/delivery-hide-item";
import { Setting } from "../browser/setting";
import { merge, splitLines } from "../share/common";
import { ElementId, ElementName, SelectorConverter } from "../share/define/element-names";
import { DeliveryHideSetting, IDeliveryHideSetting } from "../share/setting/delivery-hide-setting";
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

        this.setByName(clonedElement, ElementName.optionsDeliveryHideItemUrl, elm => elm.value = item.url);
        this.setByName(clonedElement, ElementName.optionsDeliveryHideItemSetting, elm => elm.value = JSON.stringify(item));
        
        const nameElement = clonedElement.querySelector(SelectorConverter.fromName(ElementName.optionsDeliveryHideItemName)) as HTMLElement;
        nameElement.textContent = item.name;
        this.setByName(clonedElement, ElementName.optionsDeliveryHideItemServiceGoogle, elm => elm.checked = item.service.google);
        this.setByName(clonedElement, ElementName.optionsDeliveryHideItemServiceBing, elm => elm.checked = item.service.bing);
        this.setByName(clonedElement, ElementName.optionsDeliveryHideItemRemove, elm => elm.addEventListener('click', e => {
            e.preventDefault();

            const itemGroupElement = e.srcElement!.closest(SelectorConverter.fromName(ElementName.optionsDeliveryHideItemGroup));
            itemGroupElement!.remove();
        }));
        parent.appendChild(clonedElement);
    }

    private changeEnabledImport(isEnabled: boolean) {
        const element = this.getInputById(ElementId.optionsDeliveryHideItemRegisterImport);
        element.disabled = !isEnabled;
    }

    private async importFromUserInputAsync(e: MouseEvent): Promise<void> {
        e.preventDefault();

        const inputUrl = this.getInputById(ElementId.optionsDeliveryHideItemRegisterInputUrl).value;

        const url = inputUrl.trim();

        this.changeEnabledImport(false);
        try {
            await this.importAsync(url);
        } finally {
            this.changeEnabledImport(true);
        }
    }

    private async importAsync(url: string): Promise<boolean> {
        const getter = new DeliveryHideItemGetter();
        const result = await getter.getAsync(url);

        const checkedResult = getter.checkResult(result);
        if (!checkedResult.success) {
            alert(checkedResult.message);
            return false;
        }

        const data = getter.split(result!);
        const checkedData = getter.checkData(data);
        if (!checkedData.success) {
            alert(checkedData.message);
            return false;
        }

        // URL の補正
        data.header.url = url;

        // 反映
        const hideSetting = new DeliveryHideSetting();
        merge(hideSetting, data.header);
        hideSetting.service.google = true;
        hideSetting.service.bing = true;

        // すでに登録済みなら削除しておく
        const parentElement = this.getParentElement();
        const elements = parentElement.querySelectorAll(SelectorConverter.fromName(ElementName.optionsDeliveryHideItemGroup));
        for (const element of elements) {
            const rawSetting = this.getInputByName(element, ElementName.optionsDeliveryHideItemSetting).value;
            const currentSetting = JSON.parse(rawSetting) as IDeliveryHideSetting;
            if (url === currentSetting.url) {
                element.remove();
                break;
            }
        }
        this.logger.dumpDebug('save: ' + result!);
        this.addDeliveryHideItem(hideSetting);

        // データそのものは書き込んでおく
        const setting = new Setting();
        await setting.mergeDeliverySettingAsync(hideSetting.url, splitLines(result!));
        return true;
    }
}
