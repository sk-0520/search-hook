import { HideItemSetting, IReadOnlyHideItemSetting } from "../share/setting/hide-item-setting";
import { ElementClass, toClassSelector, ElementId, ElementData } from "../share/define/element-names";
import { ActionBase, Exception } from "../share/common";
import { IService, ServiceKind } from "../share/define/service-kind";
import { BridgeMeesage, BridgeMeesageBase } from "../share/bridge/bridge-meesage";
import { BridgeMeesageKind } from "../share/define/bridge-meesage-kind";
import { ServiceBridgeData, ItemsBridgeData, EraseBridgeData, IHideRequestItem, HideRequestBridgeData, IHideResponseBridgeData } from "../share/bridge/bridge-data";
import { MatchKind } from "../share/define/match-kind";

export interface IHideCheker {
    item: HideItemSetting;
    match: (s: string) => boolean;
}

export interface IHideElementSelector {
    target: string;
    /** 隠す要素 */
    element: string;
    /** チェック対象のアンカー要素 */
    link: string;

}

export abstract class ContentServiceBase extends ActionBase implements IService {

    public abstract readonly service: ServiceKind;

    protected port?: browser.runtime.Port;

    constructor(name: string) {
        super(name);
    }

    protected abstract hideItems(hideItems: ReadonlyArray<IReadOnlyHideItemSetting>): void;
    protected abstract eraseQuery(queryItems: ReadonlyArray<string>): void;

    protected connect() {
        this.port = browser.runtime.connect();
        this.port.onMessage.addListener(rawMessage => {
            const baseMessage = rawMessage as BridgeMeesageBase;
            this.receiveMessage(baseMessage);
        });

        this.port.postMessage(
            new BridgeMeesage(
                BridgeMeesageKind.service,
                new ServiceBridgeData(this.service)
            )
        );

        this.hideItems([]);
    }

    private receiveMessage(baseMessage: BridgeMeesageBase) {
        this.logger.debug("CLIENT RECV!");
        this.logger.debug(JSON.stringify(baseMessage));

        switch (baseMessage.kind) {
            case BridgeMeesageKind.items:
                this.receiveItemsMessage(baseMessage as BridgeMeesage<ItemsBridgeData>);
                break;

            case BridgeMeesageKind.erase:
                this.receiveEraseMessage(baseMessage as BridgeMeesage<EraseBridgeData>);
                break;

            case BridgeMeesageKind.hideResponse:
                this.receiveHideResponseMessage(baseMessage as BridgeMeesage<IHideResponseBridgeData>);
                break;

            default:
                throw new Exception(baseMessage);
        }
    }

    private receiveItemsMessage(itemsMessage: BridgeMeesage<ItemsBridgeData>): void {
        if (!itemsMessage.data.enabled) {
            this.logger.debug(`ignore ${this.service} content`);
            return;
        }

        if (!itemsMessage.data.items.length) {
            this.logger.debug(`empty ${this.service} hide items`);
            return;
        }

        const hideItems = itemsMessage.data.items;
        this.hideItems(hideItems);
    }

    private receiveEraseMessage(eraseMessage: BridgeMeesage<EraseBridgeData>): void {
        if (!eraseMessage.data.enabled) {
            this.logger.debug(`ignore ${this.service} content`);
            return;
        }

        const queryItems = eraseMessage.data.items;
        this.eraseQuery(queryItems);
    }

    protected getCheckers(hideItems: ReadonlyArray<IReadOnlyHideItemSetting>): Array<IHideCheker> {
        return hideItems.map(i => {
            let func: (s: string) => boolean;

            switch (i.match.kind) {
                case MatchKind.partial:
                    if (i.match.case) {
                        const word = i.word.toUpperCase();
                        func = s => {
                            return s.toUpperCase().indexOf(word) !== -1;
                        };
                    } else {
                        func = s => {
                            return s.indexOf(i.word) !== -1;
                        };
                    }
                    break;

                case MatchKind.forward:
                    if (i.match.case) {
                        const word = i.word.toUpperCase();
                        func = s => {
                            return s.toUpperCase().indexOf(word) === 0;
                        };
                    } else {
                        func = s => {
                            return s.indexOf(i.word) === 0;
                        };
                    }
                    break;

                case MatchKind.perfect:
                    if (i.match.case) {
                        const word = i.word.toUpperCase();
                        func = s => {
                            return s.toUpperCase() === word;
                        };
                    } else {
                        func = s => {
                            return s === i.word;
                        };
                    }
                    break;

                case MatchKind.regex:
                    const reg = i.match.case ? new RegExp(i.word) : new RegExp(i.word, 'i');
                    func = s => {
                        return reg.test(s);
                    };
                    break;

                default:
                    throw { error: i };
            }

            return {
                item: i,
                match: func,
            };
        });
    }

    private matchUrl(linkValue: string, checkers: ReadonlyArray<IHideCheker>): boolean {

        let url: URL;
        try {
            url = new URL(linkValue);
        } catch (ex) {
            this.logger.error(ex);
            return false;
        }

        // プロトコル、ポート、パスワード云々は無視
        let urlValue = url.hostname;
        if (url.pathname && url.pathname.length) {
            urlValue += url.pathname;
        }
        if (url.search && url.search.length) {
            urlValue += url.search;
        }

        return checkers.some(i => i.match(urlValue));
    }

    protected matchSimpleUrl(linkValue: string, checkers: ReadonlyArray<IHideCheker>): boolean {
        return this.matchUrl(linkValue, checkers);
    }

    protected matchQueryUrl(linkValue: string, checkers: ReadonlyArray<IHideCheker>): boolean {
        try {
            const index = linkValue.indexOf('?');
            if (index !== -1) {
                const params = new URLSearchParams(linkValue.substr(index + 1));
                this.logger.debug('params: ' + params);

                if (params.has('q')) {
                    const query = params.get('q')!;
                    this.logger.debug('q: ' + query);

                    return this.matchUrl(query, checkers);
                }
            }
        } catch (ex) {
            this.logger.error(ex);
        }

        return false;
    }

    protected hideElement(element: Element) {
        element.classList.add(ElementClass.hidden);
        element.classList.add(ElementClass.hiddenItem);
    }

    protected switchHideItems() {
        const items = document.querySelectorAll(toClassSelector(ElementClass.hidden));
        if (!items.length) {
            return;
        }

        for (const item of items) {
            item.classList.toggle(ElementClass.hiddenItem);
        }
    }

    protected appendHiddenSwitch() {

        const switchElement = document.createElement('input');
        switchElement.setAttribute('id', ElementId.contentShowState);
        switchElement.setAttribute('type', 'checkbox');
        switchElement.checked = true;
        switchElement.addEventListener('change', e => {
            this.switchHideItems();
        });

        const switchImageElement = document.createElement('label');
        switchImageElement.setAttribute('for', ElementId.contentShowState);

        const parent = document.createElement('div');
        parent.appendChild(switchElement);
        parent.appendChild(switchImageElement);
        parent.classList.add(ElementClass.switch);

        document.getElementsByTagName('body')[0].appendChild(parent);
    }

    protected hideItemsCore(elementSelectors: ReadonlyArray<IHideElementSelector>, checkers: ReadonlyArray<IHideCheker>): void {
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
                if (this.matchSimpleUrl(link, checkers)) {
                    this.hideElement(element);
                    success = true;
                    continue;
                }

                // /path?q=XXX 形式
                if (this.matchQueryUrl(link, checkers)) {
                    this.hideElement(element);
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
            this.appendHiddenSwitch();
        }
    }

    protected requestHideItems(elementSelectors: ReadonlyArray<IHideElementSelector>) {
        let hideIdCounter = 0;

        const hideRequestItems = new Array<IHideRequestItem>();

        for (const elementSelector of elementSelectors) {
            this.logger.debug('target: ' + elementSelector.target);

            const elements = document.querySelectorAll(elementSelector.element);
            this.logger.debug('elements: ' + elements.length);

            for (const element of elements) {
                const linkElement = element.querySelector(elementSelector.link);
                if (!linkElement) {
                    continue;
                }
                const linkValue = linkElement.getAttribute('href');
                if (!linkValue) {
                    continue;
                }

                const parentElement = element as HTMLElement;
                const currentHideId = '' + (++hideIdCounter);
                parentElement.dataset[ElementData.hideId] = currentHideId;

                const hideRequestItem: IHideRequestItem = {
                    dataAttribute: currentHideId,
                    linkValue: linkValue,
                };
                hideRequestItems.push(hideRequestItem);
            }

            if (hideRequestItems.length) {
                break;
            }
        }

        this.logger.dumpDebug(hideRequestItems);

        if (hideRequestItems.length) {
            this.requestHideItemsCore(hideRequestItems);
        }
    }

    protected requestHideItemsCore(hideRequestItems: ReadonlyArray<IHideRequestItem>) {

        this.port!.postMessage(
            new BridgeMeesage(
                BridgeMeesageKind.hideRequest,
                new HideRequestBridgeData(this.service, hideRequestItems)
            )
        );

    }

    protected receiveHideResponseMessage(message: BridgeMeesage<IHideResponseBridgeData>) {
        this.logger.dumpDebug(message);
    }
}


