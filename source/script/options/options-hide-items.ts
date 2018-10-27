import OptionsBase from "./options-base";
import { IHideItemSetting, HideItemSetting } from "../share/setting/hide-item-setting";
import { toIdSelector, ElementId, ElementName } from "../share/define/element-names";
import { MatchKind } from "../share/define/match-kind";

export default class OptionsHideItems extends OptionsBase<Array<IHideItemSetting>> {

    constructor() {
        super('Options HideItems');
    }

    protected getParentElement(): Element {
        return document.querySelector(toIdSelector(ElementId.optionsHideItemList))!;
    }

    public initialize(): void {
        document.getElementById(ElementId.optionsHideItemInputAdd)!.addEventListener(
            'click',
            e => this.addHideItemFromInput(e)
        );
    }

    public restore(setting: Array<IHideItemSetting>): void {
        const parentElement = this.getParentElement();
        for (const item of setting) {
            this.addHideItemCore(parentElement, item);
        }
    }

    public export(): Array<IHideItemSetting> {
        const parentElement = this.getParentElement();

        const children = parentElement.querySelectorAll('tr');
        this.logger.debug(`child: ${children.length}`);

        const result = Array<HideItemSetting>();

        for (const child of children) {

            const word = this.getInputByName(child, ElementName.optionsHideItemWord).value;
            if (!word || !word.length || !word.trim().length) {
                this.logger.debug('ignore: empty word');
                continue;
            }

            const item = new HideItemSetting();
            item.word = word;
            item.service.google = this.getInputByName(child, ElementName.optionsHideItemServiceGoogle).checked;
            item.service.bing = this.getInputByName(child, ElementName.optionsHideItemServiceBing).checked;
            item.match.kind = this.getInputByName(child, ElementName.optionsHideItemMatchKind).value as MatchKind;
            item.match.case = this.getInputByName(child, ElementName.optionsHideItemMatchCase).checked;

            result.push(item);
        }

        return result;
    }


    private addHideItemFromInput(e: Event): void {
        e.preventDefault();

        const item = new HideItemSetting();
        item.word = this.getInputById(ElementId.optionsHideItemInputWord).value;
        item.match.kind = this.getInputById(ElementId.optionsHideItemInputMatchKind).value as MatchKind;
        item.match.case = this.getInputById(ElementId.optionsHideItemInputMatchCase).checked;
        item.service.google = this.getInputById(ElementId.optionsHideItemInputServiceGoogle).checked;
        item.service.bing = this.getInputById(ElementId.optionsHideItemInputServiceBing).checked;

        this.logger.debug(JSON.stringify(item));
        this.addHideItem(item);

        this.setById(ElementId.optionsHideItemInputWord, e => e.value = '');
        this.setById(ElementId.optionsHideItemInputServiceGoogle, e => e.checked = true);
        this.setById(ElementId.optionsHideItemInputServiceBing, e => e.checked = true);
    }

    private addHideItem(item: HideItemSetting) {
        this.addHideItemCore(this.getParentElement(), item);
    }

    private addHideItemCore(parent: Element, item: HideItemSetting) {
        const groupElement = document.createElement('tr');

        const wordInputElement = document.createElement('input');
        wordInputElement.setAttribute('type', 'text');
        wordInputElement.setAttribute('name', 'view-hide-item-host');
        wordInputElement.value = item.word;
        const wordElement = document.createElement('td');
        wordElement.appendChild(wordInputElement);

        const matchKindElement = document.createElement('select');
        matchKindElement.setAttribute('name', 'view-hide-item-match-kind');
        const matchElementCreator = (displayValue: string, elementValue: string) => {
            const option = document.createElement('option');
            option.setAttribute('value', elementValue);
            option.appendChild(document.createTextNode(displayValue));

            return option;
        };
        matchKindElement.appendChild(matchElementCreator('partial', 'partial'));
        matchKindElement.appendChild(matchElementCreator('forward', 'forward'));
        matchKindElement.appendChild(matchElementCreator('perfect', 'perfect'));
        matchKindElement.appendChild(matchElementCreator('regex', 'regex'));
        matchKindElement.value = item.match.kind;

        const matchKindItemElement = document.createElement('li');
        matchKindItemElement.appendChild(matchKindElement);

        const matchCaseCheckElement = document.createElement('input');
        matchCaseCheckElement.setAttribute('name', 'view-hide-item-match-case');
        matchCaseCheckElement.setAttribute('type', 'checkbox');
        matchCaseCheckElement.checked = item.match.case;

        const matchCaseLabelElement = document.createElement('label');
        matchCaseLabelElement.appendChild(matchCaseCheckElement);
        matchCaseLabelElement.appendChild(document.createTextNode('case'));

        const matchCaseItemElement = document.createElement('li');
        matchCaseItemElement.appendChild(matchCaseLabelElement);

        const matchGroupElement = document.createElement('ul');
        matchGroupElement.className = 'horizontal';
        matchGroupElement.appendChild(matchKindItemElement);
        matchGroupElement.appendChild(matchCaseItemElement);

        const matchElement = document.createElement('td');
        matchElement.appendChild(matchGroupElement);

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
        serviceGroupElement.appendChild(serviceElementCreator('google', 'view-hide-item-service-google', item.service.google));
        serviceGroupElement.appendChild(serviceElementCreator('bing', 'view-hide-item-service-bing', item.service.bing));

        const serviceGroupWrapperElement = document.createElement('form');
        serviceGroupWrapperElement.appendChild(serviceGroupElement);

        const serviceElement = document.createElement('td');
        serviceElement.appendChild(serviceGroupWrapperElement);

        const removeCommandElement = document.createElement('button');
        removeCommandElement.appendChild(document.createTextNode('remove'));
        removeCommandElement.addEventListener('click', e => {
            e.preventDefault();

            groupElement.remove();
        });
        const removeElement = document.createElement('td');
        removeElement.appendChild(removeCommandElement);

        groupElement.appendChild(wordElement);
        groupElement.appendChild(matchElement);
        groupElement.appendChild(serviceElement);
        groupElement.appendChild(removeElement);

        parent.appendChild(groupElement);
    }
}