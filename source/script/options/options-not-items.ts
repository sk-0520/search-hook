import OptionsBase from "./options-base";
import { ElementId, ElementName } from "../share/define/element-names";
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

        this.setById(ElementId.optionsNotItemInputWord, e => e.value = '');
        this.setById(ElementId.optionsNotItemInputServiceGoogle, e => e.checked = true);
        this.setById(ElementId.optionsNotItemInputServiceBing, e => e.checked = true);
    }

    private addNotItem(item: INotItemSetting) {
        this.addNotItemCore(this.getParentElement(), item);
    }

    private addNotItemCore(parent: Element, item: INotItemSetting) {
        const groupElement = document.createElement('tr');

        const wordInputElement = document.createElement('input');
        wordInputElement.setAttribute('type', 'text');
        wordInputElement.setAttribute('name', 'engine-not-item-word');
        wordInputElement.value = item.word;
        const wordElement = document.createElement('td');
        wordElement.appendChild(wordInputElement);

        const serviceElementCreator = (displayValue: string, elementName: string, isChecked: boolean) => {
            const check = document.createElement('input');
            check.setAttribute('type', 'checkbox');
            check.setAttribute('name', elementName);
            check.checked = isChecked;

            const label = document.createElement('label');
            label.appendChild(check);
            label.appendChild(document.createTextNode(displayValue));

            const li = document.createElement('li');
            li.appendChild(label);

            return li;
        };
        const serviceGroupElement = document.createElement('ul');
        serviceGroupElement.className = 'horizontal';
        serviceGroupElement.appendChild(serviceElementCreator('google', 'engine-not-item-service-google', item.service.google));
        serviceGroupElement.appendChild(serviceElementCreator('bing', 'engine-not-item-service-bing', item.service.bing));

        const serviceElement = document.createElement('td');
        serviceElement.appendChild(serviceGroupElement);

        const removeCommandElement = document.createElement('button');
        removeCommandElement.appendChild(document.createTextNode('remove'));
        removeCommandElement.addEventListener('click', e => {
            e.preventDefault();

            groupElement.remove();
        });
        const removeElement = document.createElement('td');
        removeElement.appendChild(removeCommandElement);

        groupElement.appendChild(wordElement);
        groupElement.appendChild(serviceElement);
        groupElement.appendChild(removeElement);

        parent.appendChild(groupElement);
    }
}