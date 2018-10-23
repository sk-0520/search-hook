import * as shared from "../share/common";
import * as conf from "../conf";
import ContentServiceBase from "./content-service";
import * as content from "./content";
import GoogleQuery from "../share/query/google-query";

export default class ContentGoogleService extends ContentServiceBase{
    constructor() {
        super('Content Google');
    }

    public initialize() {
        const port = browser.runtime.connect();
        port.onMessage.addListener(rawMessage => {
            var message = <shared.BridgeMeesageBase>rawMessage;
            this.logger.debug("CLIENT RECV!");
            this.logger.debug(JSON.stringify(message));

            switch(message.kind) {
                case shared.BridgeMeesageKind.items:
                    var itemsMessage = <shared.BridgeMeesage<shared.ItemsBridgeData>>message;
                    if(!itemsMessage.data.enabled) {
                        this.logger.debug("ignore google content");
                        return;
                    }
                
                    var hideItems = itemsMessage.data.items;
                    this.hideGoogleItems(hideItems);
                    break;

                case shared.BridgeMeesageKind.erase: 
                    var eraseMessage = <shared.BridgeMeesage<shared.EraseBridgeData>>message;
                    if(!eraseMessage.data.enabled) {
                        this.logger.debug("ignore google content");
                        return;
                    }

                    var items = eraseMessage.data.items;
                    this.eraseGoogleQuery(items);
                    break;

                default:
                    throw { error: message};
            }

        });
        port.postMessage(new shared.BridgeMeesage(shared.BridgeMeesageKind.service, new shared.ServiceBridgeData(shared.ServiceKind.google)));
    }

    private hideGoogleItems(hideItems: Array<conf.HiddenItemSetting>) {
        if(!hideItems || !hideItems.length) {
            this.logger.debug('empty hide items');
            return;
        }
    
        var checkers = content.getCheckers(hideItems);
    
        var elementSelectors = [
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
    
        var success = false;
        for(var i = 0; i < elementSelectors.length; i++) {
            var elementSelector = elementSelectors[i];
            
            this.logger.debug('target: ' + elementSelector.target);
    
            var elements = document.querySelectorAll(elementSelector.element);
            this.logger.debug('elements: ' + elements.length);
    
    
            for(var j = 0; j < elements.length; j++) {
                var element = elements[j];
    
                var linkElement = element.querySelector(elementSelector.link);
                if(!linkElement) {
                    continue;
                }
        
                var link = linkElement.getAttribute('href')! || '';
                this.logger.debug('link: ' + link);
        
                // 普通パターン
                if(content.matchSimleUrl(link, checkers)) {
                    content.hideElement(element);
                    success = true;
                    continue;
                }
        
                // /path?q=XXX 形式
                if(content.matchQueryUrl(link, checkers)) {
                    content.hideElement(element);
                    success = true;
                    continue;
                }
        
                this.logger.debug('show: ' + link);
            }
    
            if(success) {
                break;
            }
        }
    
        if(success) {
            content.appendHiddenSwitch();
        }
    }
    
    private eraseGoogleQuery(items:Array<string>) {
        var queryElement = document.querySelector('input[name="q"]') as HTMLInputElement;
        var queryValue = queryElement.value;
        this.logger.debug('q: ' + queryValue);

        var query = new GoogleQuery();
    
        var currentQuery = query.splitQuery(queryValue);
        var userInputQuery = query.getUserInputQuery(currentQuery, items);
        this.logger.debug('u: ' + userInputQuery);
    
        queryElement.value = userInputQuery.join(' ') + ' ';
    
        // サジェストが鬱陶しい問題
        var suggestElement = document.querySelector('.sbdd_a, .gssb_c') as HTMLElement;
        if(suggestElement) {
            this.logger.debug('has suggest');
            var observer = new MutationObserver(mutations => {
                if(document.activeElement != queryElement) {
                    if(suggestElement!.style.display !== 'none') {
                        this.logger.debug('suggest disable');
                        suggestElement!.style.display = 'none';
                    }
                } else {
                    this.logger.debug('suggest enable');
                }
                observer.disconnect();
            });
            var config = {
                attributes: true,
                childList: false,
                characterData: false
            };
            observer.observe(suggestElement, config);
        }
    }
    
}