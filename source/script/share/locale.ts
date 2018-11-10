import { ElementClass, ElementData, SelectorConverter } from "./define/element-names";
import { LoggingBase } from "./common";

export class Locale extends LoggingBase {

    private static readonly emptyMark = '@EMPTY';

    constructor() {
        super('Locale');
    }

    public attachLocaleRoot() {
        const rootElements = document.querySelectorAll(SelectorConverter.fromClass(ElementClass.localeRoot));

        for (const element of rootElements) {
            for (const dataElement of element.querySelectorAll(SelectorConverter.fromData(ElementData.locale))) {
                this.applyLocale(dataElement as HTMLElement);
            }
        }

        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                const element = mutation.target as HTMLElement;
                if (element) {
                    for (const dataElement of element.querySelectorAll(SelectorConverter.fromData(ElementData.locale))) {
                        this.applyLocale(dataElement as HTMLElement);
                    }
                }
            }
        });
        const config = {
            childList: true,
            subtree: true,
        };
        for (const element of rootElements) {
            observer.observe(element, config);
        }
    }

    public applyLocale(element: HTMLElement) {
        const localeKey = element.dataset[ElementData.locale];
        if (localeKey) {
            this.applyLocaleCore(element, localeKey);
        }
    }

    private applyLocaleCore(element: HTMLElement, localeKey: string) {

        // テキスト割り当て
        if (localeKey !== Locale.emptyMark) {
            const localeValue = browser.i18n.getMessage(localeKey);
            if (localeValue) {
                if (element.textContent !== localeValue) {
                    element.textContent = localeValue;
                }
            }
        }

        // 属性割り当て(locale-attributesが設定されている項目に限定)
        const attributes: Array<{ attr: string, localeKey: string }> = [];
        for (const key in element.dataset) {
            if (element.dataset[key] && key.startsWith(ElementData.localeAttributeHead)) {
                const pair = {
                    attr: key.substr(ElementData.localeAttributeHead.length),
                    localeKey: element.dataset[key]!
                };
                attributes.push(pair);
            }
        }
        if (attributes.length) {
            for (const pair of attributes) {
                const currentValue = element.getAttribute(pair.attr);
                const localeValue = browser.i18n.getMessage(pair.localeKey);
                if (localeValue) {
                    if (currentValue) {
                        if (currentValue !== localeValue) {
                            element.setAttribute(pair.attr, localeValue);
                        }
                    } else {
                        element.setAttribute(pair.attr, localeValue);
                    }
                }
            }
        }
    }

}


