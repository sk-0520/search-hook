import OptionsBase from "./options-base";
import { ElementId, ElementName, toNameSelector } from "../share/define/element-names";
import { INotItemSetting, NotItemSetting } from "../share/setting/not-item-setting";

export default class OptionsNotItems extends OptionsBase<Array<INotItemSetting>> {

    constructor() {
        super('Options NotItems');
    }

    protected getParentElement(): Element {
        return document.getElementById(ElementId.optionsNotItemList)!;
    }

    public initialize(): void {
        document.getElementById(ElementId.optionsNotItemInputAdd)!.addEventListener(
            'click',
            e => this.addNotItemFromInput(e)
        );
    }

    public restore(setting: INotItemSetting[]): void {
        const parentElement = this.getParentElement();
        for (const item of setting) {
            this.addNotItemCore(parentElement, item);
        }
    }

    public export(): INotItemSetting[] {
        const parentElement = this.getParentElement();

        const children = parentElement.querySelectorAll('tr');
        this.logger.debug(`child: ${children.length}`);

        const result = new Array<NotItemSetting>();

        for (const child of children) {

            const word = this.getInputByName(child, ElementName.optionsNotItemWord).value;
            if (!word || !word.length || !word.trim().length) {
                this.logger.debug('ignore: empty word');
                continue;
            }

            const item = new NotItemSetting();
            item.word = word;
            item.service.google = this.getInputByName(child, ElementName.optionsNotItemServiceGoogle).checked;
            item.service.bing = this.getInputByName(child, ElementName.optionsNotItemServiceBing).checked;

            result.push(item);
        }

        return result;
    }

    private addNotItemFromInput(e: Event) {
        e.preventDefault();

        const item = new NotItemSetting();

        item.word = this.getInputById(ElementId.optionsNotItemInputWord).value;
        item.service.google = this.getInputById(ElementId.optionsNotItemInputServiceGoogle).checked;
        item.service.bing = this.getInputById(ElementId.optionsNotItemInputServiceBing).checked;

        this.logger.debug(JSON.stringify(item));
        this.addNotItem(item);

        this.setById(ElementId.optionsNotItemInputWord, elm => elm.value = '');
        this.setById(ElementId.optionsNotItemInputServiceGoogle, elm => elm.checked = true);
        this.setById(ElementId.optionsNotItemInputServiceBing, elm => elm.checked = true);
    }

    private addNotItem(item: INotItemSetting) {
        this.addNotItemCore(this.getParentElement(), item);
    }

    private addNotItemCore(parent: Element, item: INotItemSetting) {

        const templateElement = parent.querySelector("template")!;
        const clonedElement = document.importNode(templateElement.content, true);

        this.setByName(clonedElement, ElementName.optionsNotItemWord, elm => elm.value = item.word);
        this.setByName(clonedElement, ElementName.optionsNotItemServiceGoogle, elm => elm.checked = item.service.google);
        this.setByName(clonedElement, ElementName.optionsNotItemServiceBing, elm => elm.checked = item.service.bing);
        this.setByName(clonedElement, ElementName.optionsNotItemRemove, elm => elm.addEventListener('click', e => {
            e.preventDefault();

            const itemGroupElement = e.srcElement!.closest(toNameSelector(ElementName.optionsNotItemGroup));
            itemGroupElement!.remove();
        }));

        parent.appendChild(clonedElement);
    }
}
