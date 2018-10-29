import { toClassSelector, ElementClass, toDataSelector, ElementData } from "./define/element-names";
import { LoggingBase } from "./common";

export class Locale extends LoggingBase {

    static readonly emptyMark = '@EMPTY';

    constructor() {
        super('Locale');
    }

    public attachLocaleRoot() {
        const rootElements = document.querySelectorAll(toClassSelector(ElementClass.localeRoot));

        for (const element of rootElements) {
            for (const dataElement of element.querySelectorAll(toDataSelector(ElementData.locale))) {
                this.applyLocale(dataElement as HTMLElement);
            }
        }
        
        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                const element = mutation.target as HTMLElement;
                if (element) {
                    for (const dataElement of element.querySelectorAll(toDataSelector(ElementData.locale))) {
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
        this.logger.debug(element.outerHTML);
        this.logger.debug(localeKey);

        // テキスト割り当て
        if(localeKey !== Locale.emptyMark){
            const localeValue = browser.i18n.getMessage(localeKey);
            if(localeValue) {
                if(element.textContent !== localeValue) {
                    element.textContent = localeValue;
                } 
            }
        }

        // 属性割り当て(locale-attributesが設定されている項目に限定)
        if(element.dataset[ElementData.localeAttributes]) {
            var attributes: Array<{ attr:string, localeKey:string }> = [];
            for(const key in element.dataset) {
                if(element.dataset[key] && key.startsWith(ElementData.localeAttributeHead)) {
                    const pair = {
                        attr: key.substr(ElementData.localeAttributeHead.length),
                        localeKey: element.dataset[key]!
                    };
                    attributes.push(pair);
                }
            }
            if(attributes.length) {
                for(const pair of attributes) {
                    var currentValue = element.getAttribute(pair.attr);
                    const localeValue = browser.i18n.getMessage(pair.localeKey);
                    if(localeValue) {
                        if(currentValue) {
                            if(currentValue !== localeValue) {
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

}


/*
            const observer = new MutationObserver(mutations => {
                if (document.activeElement !== queryElement) {
                    if (suggestElement!.style.display !== 'none') {
                        this.logger.debug('suggest disable');
                        suggestElement!.style.display = 'none';
                    }
                } else {
                    this.logger.debug('suggest enable');
                }
                observer.disconnect();
            });
            const config = {
                attributes: true,
                childList: false,
                characterData: false
            };
            observer.observe(suggestElement, config);
*/




