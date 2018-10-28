import { ActionBase } from "../share/common";
import { ElementName, ElementId, toNameSelector } from "../share/define/element-names";

export default abstract class OptionsBase<TSetting> extends ActionBase {

    protected constructor(name: string) {
        super(name);
    }

    public abstract restore(setting: TSetting): void;
    public abstract export(): TSetting;

    protected abstract getParentElement(): Element;

    protected setById(elementId: ElementId, setter: (elm: HTMLInputElement) => void): void {
        const element = document.getElementById(elementId) as HTMLInputElement;
        setter(element);
    }

    protected setByName(parentElement: Element|DocumentFragment, elementName: ElementName, setter: (elm: HTMLInputElement) => void): void {
        const element = parentElement.querySelector(toNameSelector(elementName)) as HTMLInputElement;
        setter(element);
    }

    protected getInput(selctor: string): HTMLInputElement {
        return document.querySelector(selctor) as HTMLInputElement;
    }

    protected getInputById(elementId: ElementId): HTMLInputElement {
        return document.getElementById(elementId) as HTMLInputElement;
    }

    protected getInputByName(parentElement: Element|DocumentFragment, elementName: ElementName): HTMLInputElement {
        return parentElement.querySelector(toNameSelector(elementName)) as HTMLInputElement;
    }
}
