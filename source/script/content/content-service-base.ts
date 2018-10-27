import { BridgeMeesageBase, BridgeMeesage } from "../share/bridge/bridge-meesage";
import { BridgeMeesageKind } from "../share/define/bridge-meesage-kind";
import { Exception, ActionBase } from "../share/common";
import { ServiceBridgeData, ItemsBridgeData, EraseBridgeData } from "../share/bridge/bridge-data";
import { ServiceKind, IService } from "../share/define/service-kind";
import { IReadOnlyHideItemSetting } from "../share/setting/hide-item-setting";

export default abstract class ContentServiceBase extends ActionBase implements IService {

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
            this.logger.debug('empty hide items');
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

}
