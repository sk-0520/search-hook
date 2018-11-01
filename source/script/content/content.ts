import { NotWordResponseBridgeData, HideRequestBridgeData, IHideRequestItem, IHideResponseBridgeData, BridgeData } from "../share/bridge/bridge-data";
import { BridgeMeesage, BridgeMeesageBase } from "../share/bridge/bridge-meesage";
import { ActionBase, Exception, isNullOrEmpty } from "../share/common";
import { BridgeMeesageKind } from "../share/define/bridge-meesage-kind";
import { ElementClass, ElementData, ElementId, toClassSelector, toDataSelector } from "../share/define/element-names";
import { IService, ServiceKind } from "../share/define/service-kind";
import { HideItemSetting } from "../share/setting/hide-item-setting";

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

    protected abstract eraseQuery(queryItems: ReadonlyArray<string>): void;
    protected abstract getHideElementSelectors(): ReadonlyArray<IHideElementSelector>;

    protected connect() {
        this.port = browser.runtime.connect();
        this.port.onMessage.addListener(rawMessage => {
            const baseMessage = rawMessage as BridgeMeesageBase;
            this.receiveMessage(baseMessage);
        });

        this.port.postMessage(
            new BridgeMeesage(
                BridgeMeesageKind.notWordRequest,
                new BridgeData(this.service)
            )
        );

        const hideElementSelectors = this.getHideElementSelectors();
        this.requestHideItems(hideElementSelectors);
    }

    private receiveMessage(baseMessage: BridgeMeesageBase) {
        this.logger.debug("CLIENT RECV!");
        this.logger.debug(JSON.stringify(baseMessage));

        switch (baseMessage.kind) {

            case BridgeMeesageKind.notWordResponse:
                this.receiveNotWordResponseMessage(baseMessage as BridgeMeesage<NotWordResponseBridgeData>);
                break;

            case BridgeMeesageKind.hideResponse:
                this.receiveHideResponseMessage(baseMessage as BridgeMeesage<IHideResponseBridgeData>);
                break;

            default:
                throw new Exception(baseMessage);
        }
    }

    private receiveNotWordResponseMessage(eraseMessage: BridgeMeesage<NotWordResponseBridgeData>): void {
        if (!eraseMessage.data.enabled) {
            this.logger.debug(`ignore ${this.service} content`);
            return;
        }

        const queryItems = eraseMessage.data.items;
        this.eraseQuery(queryItems);
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
                if (isNullOrEmpty(linkValue)) {
                    continue;
                }

                const parentElement = element as HTMLElement;
                const currentHideId = '' + (++hideIdCounter);
                parentElement.dataset[ElementData.hideId] = currentHideId;

                const hideRequestItem: IHideRequestItem = {
                    dataValue: currentHideId,
                    linkValue: linkValue!,
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
        if (!message.data.enabled) {
            this.logger.debug('ignore hide');
            return;
        }

        const targetMap = new Map<string, HTMLElement>();
        for (const element of document.querySelectorAll(toDataSelector(ElementData.hideId))) {
            const htmlELement = element as HTMLElement;
            targetMap.set(htmlELement.dataset[ElementData.hideId]!, htmlELement);
        }

        let success = false;
        for (const responseItem of message.data.items) {
            if (responseItem.hideTarget) {
                if(targetMap.has(responseItem.request.dataValue)) {
                    const element = targetMap.get(responseItem.request.dataValue);
                    this.hideElement(element!);
                    success = true;
                }
            }
        }

        if(success) {
            this.appendHiddenSwitch();
        }
    }
}


