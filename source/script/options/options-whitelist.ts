import { IWhitelistItemSetting, WhitelistItemSetting } from "../share/setting/whitelist-item-setting";
import OptionsBase from "./options-base";
import { ElementId, ElementName, SelectorConverter } from "../share/define/element-names";
import { MatchKind } from "../share/define/match-kind";

export default class OptionsWhitelistItems extends OptionsBase<Array<IWhitelistItemSetting>> {

    constructor() {
        super('Options Whitelist');
    }

    protected getParentElement(): Element {
        return document.getElementById(ElementId.optionsWhitelistList)!;
    }

    public initialize(): void {
        document.getElementById(ElementId.optionsWhitelistInputAdd)!.addEventListener(
            'click',
            e => this.addWhitelistItemFromInput(e)
        );
    }

    public restore(setting: IWhitelistItemSetting[]): void {
        const parentElement = this.getParentElement();
        for (const item of setting) {
            this.addWhitelistItemCore(parentElement, item);
        }
    }

    public export(): IWhitelistItemSetting[] {
        const parentElement = this.getParentElement();

        const children = parentElement.querySelectorAll('tr');
        this.logger.debug(`child: ${children.length}`);

        const result = Array<WhitelistItemSetting>();

        for (const child of children) {

            const word = this.getInputByName(child, ElementName.optionsWhitelistWord).value;
            if (!word || !word.length || !word.trim().length) {
                this.logger.debug('ignore: empty word');
                continue;
            }

            const item = new WhitelistItemSetting();
            item.word = word;
            item.service.google = this.getInputByName(child, ElementName.optionsWhitelistServiceGoogle).checked;
            item.service.bing = this.getInputByName(child, ElementName.optionsWhitelistServiceBing).checked;
            item.match.kind = this.getInputByName(child, ElementName.optionsWhitelistMatchKind).value as MatchKind;
            item.match.case = this.getInputByName(child, ElementName.optionsWhitelistMatchCase).checked;

            result.push(item);
        }

        return result;
    }


    private addWhitelistItemFromInput(e: Event): void {
        e.preventDefault();

        const item = new WhitelistItemSetting();
        item.word = this.getInputById(ElementId.optionsWhitelistInputWord).value;
        item.match.kind = this.getInputById(ElementId.optionsWhitelistInputMatchKind).value as MatchKind;
        item.match.case = this.getInputById(ElementId.optionsWhitelistInputMatchCase).checked;
        item.service.google = this.getInputById(ElementId.optionsWhitelistInputServiceGoogle).checked;
        item.service.bing = this.getInputById(ElementId.optionsWhitelistInputServiceBing).checked;

        this.logger.debug(JSON.stringify(item));
        this.addWhitelistItem(item);

        this.setById(ElementId.optionsWhitelistInputWord, elm => elm.value = '');
        this.setById(ElementId.optionsWhitelistInputServiceGoogle, elm => elm.checked = true);
        this.setById(ElementId.optionsWhitelistInputServiceBing, elm => elm.checked = true);
    }

    private addWhitelistItem(item: WhitelistItemSetting) {
        this.addWhitelistItemCore(this.getParentElement(), item);
    }

    private addWhitelistItemCore(parent: Element, item: WhitelistItemSetting) {

        const templateElement = parent.querySelector("template")!;
        const clonedElement = document.importNode(templateElement.content, true);

        this.setByName(clonedElement, ElementName.optionsWhitelistWord, elm => elm.value = item.word);
        this.setByName(clonedElement, ElementName.optionsWhitelistMatchKind, elm => elm.value = item.match.kind);
        this.setByName(clonedElement, ElementName.optionsWhitelistMatchCase, elm => elm.checked = item.match.case);
        this.setByName(clonedElement, ElementName.optionsWhitelistServiceGoogle, elm => elm.checked = item.service.google);
        this.setByName(clonedElement, ElementName.optionsWhitelistServiceBing, elm => elm.checked = item.service.bing);
        this.setByName(clonedElement, ElementName.optionsWhitelistRemove, elm => elm.addEventListener('click', e => {
            e.preventDefault();

            const itemGroupElement = e.srcElement!.closest(SelectorConverter.fromName(ElementName.optionsWhitelistGroup));
            itemGroupElement!.remove();
        }));
        parent.appendChild(clonedElement);
    }
}


