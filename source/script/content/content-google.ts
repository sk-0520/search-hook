import * as conf from "../conf";
import * as shared from "../share/common";
import GoogleQuery from "../share/query/google-query";
import { ServiceKind } from "../share/service-kind";
import * as content from "./content";
import ContentServiceBase from "./content-service";

export default class ContentGoogleService extends ContentServiceBase {
    constructor() {
        super('Content Google');
    }

    public initialize() {
        const port = browser.runtime.connect();
        port.onMessage.addListener(rawMessage => {
            const message = rawMessage as shared.BridgeMeesageBase;
            this.logger.debug("CLIENT RECV!");
            this.logger.debug(JSON.stringify(message));

            switch (message.kind) {
                case shared.BridgeMeesageKind.items:
                    const itemsMessage = message as shared.BridgeMeesage<shared.ItemsBridgeData>;
                    if (!itemsMessage.data.enabled) {
                        this.logger.debug("ignore google content");
                        return;
                    }

                    const hideItems = itemsMessage.data.items;
                    this.hideGoogleItems(hideItems);
                    break;

                case shared.BridgeMeesageKind.erase:
                    const eraseMessage = message as shared.BridgeMeesage<shared.EraseBridgeData>;
                    if (!eraseMessage.data.enabled) {
                        this.logger.debug("ignore google content");
                        return;
                    }

                    const items = eraseMessage.data.items;
                    this.eraseGoogleQuery(items);
                    break;

                default:
                    throw { error: message };
            }

        });
        port.postMessage(
            new shared.BridgeMeesage(
                shared.BridgeMeesageKind.service, 
                new shared.ServiceBridgeData(ServiceKind.google)
            )
        );
    }

    private hideGoogleItems(hideItems: Array<conf.HiddenItemSetting>) {
        if (!hideItems || !hideItems.length) {
            this.logger.debug('empty hide items');
            return;
        }

        const checkers = content.getCheckers(hideItems);

        const elementSelectors = [
            {
                target: 'smart',
                element: '#main > div',
                link: 'a[href^="/url?q="]'
            },
            {
                target: 'touch',
                element: '.srg > div',
                link: 'a[ping]'
            },
            {
                target: 'universal',
                element: '#universal > div',
                link: 'a'
            },
            {
                target: 'default',
                element: '.g',
                link: 'a'
            }
        ];

        let success = false;
        for (const elementSelector of elementSelectors) {

            this.logger.debug('target: ' + elementSelector.target);

            const elements = document.querySelectorAll(elementSelector.element);
            this.logger.debug('elements: ' + elements.length);

            for (const element of elements) {
                const linkElement = element.querySelector(elementSelector.link);
                if (!linkElement) {
                    continue;
                }

                const link = linkElement.getAttribute('href')! || '';
                this.logger.debug('link: ' + link);

                // 普通パターン
                if (content.matchSimleUrl(link, checkers)) {
                    content.hideElement(element);
                    success = true;
                    continue;
                }

                // /path?q=XXX 形式
                if (content.matchQueryUrl(link, checkers)) {
                    content.hideElement(element);
                    success = true;
                    continue;
                }

                this.logger.debug('show: ' + link);
            }

            if (success) {
                break;
            }
        }

        if (success) {
            content.appendHiddenSwitch();
        }
    }

    private eraseGoogleQuery(items: Array<string>) {
        const queryElement = document.querySelector('input[name="q"]') as HTMLInputElement;
        const queryValue = queryElement.value;
        this.logger.debug('q: ' + queryValue);

        const query = new GoogleQuery();

        const currentQuery = query.splitQuery(queryValue);
        const userInputQuery = query.getUserInputQuery(currentQuery, items);
        this.logger.debug('u: ' + userInputQuery);

        queryElement.value = userInputQuery.join(' ') + ' ';

        // サジェストが鬱陶しい問題
        const suggestElement = document.querySelector('.sbdd_a, .gssb_c') as HTMLElement;
        if (suggestElement) {
            this.logger.debug('has suggest');
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
        }
    }
}
