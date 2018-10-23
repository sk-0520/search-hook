import * as shared from "../share/common";
import * as conf from "../conf";
import ContentServiceBase from "./content-service";
import * as content from "./content";
import BingQuery from "../share/query/bing-query";

export default class ContentBingService extends ContentServiceBase{
    constructor() {
        super('Content Bing');
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
                        this.logger.debug("ignore bing content");
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
                    this.eraseBingQuery(items);
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
                target: 'default',
                element: '.b_algo',
                link: 'a'
            },
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
    
    private eraseBingQuery(items:Array<string>) {
        var queryElement = document.querySelector('input[name="q"]') as HTMLInputElement;
        var queryValue = queryElement.value;
        this.logger.debug('q: ' + queryValue);

        var query = new BingQuery();
    
        var currentQuery = query.splitQuery(queryValue);
        var userInputQuery = query.getUserInputQuery(currentQuery, items);
        this.logger.debug('u: ' + userInputQuery);
    
        queryElement.value = userInputQuery.join(' ') + ' ';
    }
    
}