import { toClassSelector, ElementClass, toDataSelector, ElementData } from "./define/element-names";
import { LoggingBase } from "./common";

export class Locale extends LoggingBase {

    constructor() {
        super('Locale');
    }

    public attachLocaleRoot() {
        const rootElements = document.querySelectorAll(toClassSelector(ElementClass.localeRoot));

        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                const elm = mutation.target as HTMLElement;
                if (elm) {
                    this.applyLocale(elm);
                }
            }
        });
        const config = {
            childList: true,
            subtree: true,
        };

        for (const element of rootElements) {
            observer.observe(element, config);
            for (const dataElement of element.querySelectorAll(toDataSelector(ElementData.locale))) {
                this.applyLocale(dataElement as HTMLElement);
            }
        }
    }

    public applyLocale(element: HTMLElement) {
        var localeKey = element.dataset[ElementData.locale];
        if (localeKey) {
            this.applyLocaleCore(element, localeKey);
        }
    }
    private applyLocaleCore(element: HTMLElement, localeKey: string) {
        this.logger.debug(element.outerHTML);
        this.logger.debug(localeKey);

        const targets = element.dataset[ElementData.localeTargets];
        if(!targets) {
            this.logger.debug(localeKey);
            element.innerText = browser.i18n.getMessage(localeKey);
        } else {
            this.logger.warn(`targets: ${targets}`);
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




