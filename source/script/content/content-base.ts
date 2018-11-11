import { HideRequestBridgeData, IHideRequestItem, IHideResponseBridgeData, NotWordResponseBridgeData, ServiceBridgeData } from "../share/bridge/bridge-data";
import { BridgeMeesage, BridgeMeesageBase } from "../share/bridge/bridge-meesage";
import { ActionBase, Exception, isNullOrEmpty } from "../share/common";
import { BridgeMeesageKind } from "../share/define/bridge-meesage-kind";
import { ElementClass, ElementData, ElementId, SelectorConverter } from "../share/define/element-names";
import { IService, ServiceKind } from "../share/define/service-kind";
import { ILogger } from "../share/logger";
import { QueryBase } from "../share/query/query-base";
import { ContentLogger } from "./content-logger";

export interface IHideElementSelector {
    target: string;
    /** 隠す要素 */
    element: string;
    /** チェック対象のアンカー要素 */
    link: string;
}

export abstract class ContentBase extends ActionBase {
    protected port?: browser.runtime.Port;
    private contentLogger?: ILogger;

    protected get logger(): ILogger {
        return this.contentLogger || super.logger;
    }

    constructor(name: string) {
        super(name);
    }

    protected connect() {
        this.port = browser.runtime.connect();

        this.contentLogger = new ContentLogger(this.logger.name, this.port!);

        this.port.onMessage.addListener(rawMessage => {
            const baseMessage = rawMessage as BridgeMeesageBase;
            this.receiveMessage(baseMessage);
        });

    }

    protected receiveMessage(baseMessage: BridgeMeesageBase) {
        this.logger.debug("CLIENT RECV!");
        this.logger.debug(JSON.stringify(baseMessage));
    }

}

export abstract class ContentServiceBase extends ContentBase implements IService {

    public abstract readonly service: ServiceKind;

    protected notWords?: ReadonlyArray<string>;

    constructor(name: string) {
        super(name);
    }

    protected abstract createQuery(): QueryBase;
    protected abstract getQueryInputElement(): HTMLInputElement;
    protected abstract getHideElementSelectors(): ReadonlyArray<IHideElementSelector>;

    protected connect() {
        super.connect();

        if(this.port) {
            this.port.postMessage(
                new BridgeMeesage(
                    BridgeMeesageKind.notWordRequest,
                    new ServiceBridgeData(this.service)
                )
            );
    
            const hideElementSelectors = this.getHideElementSelectors();
            this.requestHideItems(hideElementSelectors);
        }
    }

    protected receiveMessage(baseMessage: BridgeMeesageBase) {
        super.receiveMessage(baseMessage);

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

        this.notWords = eraseMessage.data.items;

        this.attachQueryElement();
    }

    protected attachQueryElement() {
        if (!this.notWords) {
            return;
        }
        if (!this.notWords.length) {
            return;
        }

        const inputElement = this.getQueryInputElement();
        inputElement.addEventListener('focus', e => {
            const currentPos = inputElement.selectionStart || 0;
            const query = this.createQuery();
            const queryWords = query.split(inputElement.value);
            const filterdWords = query.getUserInput(queryWords, this.notWords!);
            const filterdQuery = query.toString(filterdWords);
            const newPos = filterdQuery.length < currentPos ? filterdQuery.length : currentPos;
            inputElement.value = filterdQuery;
            inputElement.setSelectionRange(newPos, newPos);
        });
    }

    protected hideElement(element: Element) {
        element.classList.add(ElementClass.hidden);
        element.classList.add(ElementClass.hiddenItem);
    }

    protected switchHideItems() {
        const items = document.querySelectorAll(SelectorConverter.fromClass(ElementClass.hidden));
        if (!items.length) {
            return;
        }

        for (const item of items) {
            item.classList.toggle(ElementClass.hiddenItem);
        }
    }

    protected appendHiddenSwitch() {

        const switchTemplate = `
        <div class="${ElementClass.switch}">
            <input id="${ElementId.contentShowState}" type="checkbox" checked />
            <label for="${ElementId.contentShowState}"></label>
        </div>
        `;

        document.body.insertAdjacentHTML('beforeend', switchTemplate);
        const switchElement = document.getElementById(ElementId.contentShowState);
        switchElement!.addEventListener('change', e => {
            this.switchHideItems();
        });
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
        for (const element of document.querySelectorAll(SelectorConverter.fromData(ElementData.hideId))) {
            const htmlELement = element as HTMLElement;
            targetMap.set(htmlELement.dataset[ElementData.hideId]!, htmlELement);
        }

        let success = false;
        for (const responseItem of message.data.items) {
            if (responseItem.hideTarget) {
                if (targetMap.has(responseItem.request.dataValue)) {
                    const element = targetMap.get(responseItem.request.dataValue);
                    this.hideElement(element!);
                    success = true;
                }
            }
        }

        if (success) {
            this.appendHiddenSwitch();
        }
    }
}


