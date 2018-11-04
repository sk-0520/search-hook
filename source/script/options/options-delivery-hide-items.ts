import { IDeliveryHideSetting, DeliveryHideSetting } from "../share/setting/delivery-hide-setting";
import OptionsBase from "./options-base";
import { ElementId, ElementName, SelectorConverter } from "../share/define/element-names";
import { DeliveryHideItemGetter } from "../browser/delivery-hide-item";
import { isNullOrEmpty, merge, splitLines } from "../share/common";
import { ServiceEnabledSetting } from "../share/setting/service-enabled-setting";
import { Setting } from "../browser/setting";

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

        for(const element of elements) {
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

    private importAsync(url: string): Promise<boolean> {
        const getter = new DeliveryHideItemGetter();
        return getter.getAsync(url).then(
            result => {
                if (isNullOrEmpty(result)) {
                    alert('error: HTTP(S)');
                    return Promise.resolve(false);
                }

                const data = getter.split(result!);
                if (isNullOrEmpty(data.header.name)) {
                    alert('error: empty name');
                    return Promise.resolve(false);
                }
                if (isNullOrEmpty(data.header.version)) {
                    alert('error: empty version');
                    return Promise.resolve(false);
                }

                if (!data.lines.length || data.lines.every(s => isNullOrEmpty(s))) {
                    alert('error: empty data');
                    return Promise.resolve(false);
                }
                // URL の補正
                data.header.url = url;

                // 反映
                const hideSetting = new DeliveryHideSetting();
                merge(hideSetting, data.header);
                hideSetting.service.google = true;
                hideSetting.service.bing = true;

                this.addDeliveryHideItem(hideSetting);

                // データそのものは書き込んでおく
                const setting = new Setting();
                return setting.mergeDeliverySettingAsync(hideSetting.url, splitLines(result!)).then(r => true);
            }
        );
    }
}
