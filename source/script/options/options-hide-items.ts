import OptionsBase from "./options-base";
import { IHideItemSetting, HideItemSetting } from "../share/setting/hide-item-setting";
import { toIdSelector, ElementId, ElementName, toNameSelector } from "../share/define/element-names";
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

        this.setById(ElementId.optionsHideItemInputWord, elm => elm.value = '');
        this.setById(ElementId.optionsHideItemInputServiceGoogle, elm => elm.checked = true);
        this.setById(ElementId.optionsHideItemInputServiceBing, elm => elm.checked = true);
    }

    private addHideItem(item: HideItemSetting) {
        this.addHideItemCore(this.getParentElement(), item);
    }

    private addHideItemCore(parent: Element, item: HideItemSetting) {

        const templateElement = parent.querySelector("template")!;
        const clonedElement = document.importNode(templateElement.content, true);

        this.setByName(clonedElement, ElementName.optionsHideItemWord, elm => elm.value = item.word);
        this.setByName(clonedElement, ElementName.optionsHideItemMatchKind, elm => elm.value = item.match.kind);
        this.setByName(clonedElement, ElementName.optionsHideItemMatchCase, elm => elm.checked = item.match.case);
        this.setByName(clonedElement, ElementName.optionsHideItemServiceGoogle, elm => elm.checked = item.service.google);
        this.setByName(clonedElement, ElementName.optionsHideItemServiceBing, elm => elm.checked = item.service.bing);
        this.setByName(clonedElement, ElementName.optionsHideItemRemove, elm => elm.addEventListener('click', e => {
            e.preventDefault();

            const itemGroupElement = e.srcElement!.closest(toNameSelector(ElementName.optionsHideItemGroup));
            itemGroupElement!.remove();
        }));
        parent.appendChild(clonedElement);
    }
}
