import { getDeliveryHideItemAsync } from '../browser/delivery-hide-item';
import { Setting } from '../browser/setting';
import { IBridgeData, IHideRequestBridgeData, IOutputLogBridgeData, IRegisterDeliveryHideRequestData, IServiceBridgeData, RegisterDeliveryHideResponseData } from '../share/bridge/bridge-data';
import { BridgeMeesage } from '../share/bridge/bridge-meesage';
import { ActionBase, Exception } from '../share/common';
import { BridgeMeesageKind } from '../share/define/bridge-meesage-kind';
import { ServiceKind } from '../share/define/service-kind';
import { LogKind } from '../share/logger';
import { IReadOnlyDeliveryHideSetting } from '../share/setting/delivery-hide-setting';
import { IDeliverySetting, IReadOnlyDeliverySetting } from '../share/setting/delivery-setting';
import { IMainSetting } from '../share/setting/main-setting';
import { IReadOnlyServiceSetting } from '../share/setting/service-setting-base';
import { BackgroundServiceBase, ISettingItems } from './background-base';
import BackgroundServiceBing from './background-bing';
import BackgroundServiceGoogle from './background-google';
import BridgeLoger from './bridgelogger';

export default class Background extends ActionBase {

    protected port?: browser.runtime.Port;
    private backgroundServiceMap = new Map<ServiceKind, BackgroundServiceBase<IReadOnlyServiceSetting>>();

    public constructor() {
        super('Background');
    }

    public initialize() {
        this.logger.log('init');
        this.loadSetting();
    }

    private loadSetting(): Promise<void> {
        this.logger.log('loading');

        const setting = new Setting();
        return Promise.all([
            setting.loadMainSettingAsync(),
            setting.loadDeliverySettingAsync(),
        ]).then(
            result => {
                const mainSetting = setting.tuneMainSetting(result[0]);
                const deliverySetting = setting.tuneDeliverySetting(result[1]);

                this.startBackground(mainSetting, deliverySetting);
            },
            error => this.logger.dumpError(error)
        );
    }

    private startBackground(mainSetting: IMainSetting, deliverySetting: IDeliverySetting) {
        this.logger.log('start');
        this.logger.debug('MAIN: ' + JSON.stringify(mainSetting));
        this.logger.debug('DELIVERY: ' + JSON.stringify(deliverySetting));

        const settingItems: ISettingItems = {
            notItems: mainSetting.notItems,
            hideItems: mainSetting.hideItems,
        };
        this.backgroundServiceMap.set(ServiceKind.google, new BackgroundServiceGoogle(mainSetting.service.google, settingItems));
        this.backgroundServiceMap.set(ServiceKind.bing, new BackgroundServiceBing(mainSetting.service.google, settingItems));

        this.buildDeliverySetting(mainSetting.deliveryHideItems, deliverySetting, this.backgroundServiceMap);

        for (const [key, service] of this.backgroundServiceMap) {
            this.logger.debug(`build service ${key}`);
            service.registerRedirect();
        }

        this.accept();
    }

    private buildDeliverySetting(
        deliveryHideItems: ReadonlyArray<IReadOnlyDeliveryHideSetting>,
        deliverySetting: IReadOnlyDeliverySetting,
        serviceMap: ReadonlyMap<ServiceKind, BackgroundServiceBase<IReadOnlyServiceSetting>>
    ): void {
        for (const service of serviceMap.values()) {
            service.importDeliveryHideItems(deliveryHideItems, deliverySetting);
        }

        // 適当に更新する, TODO: タイミング等々の整理
        this.reloadDeliveryHideItems(deliveryHideItems, serviceMap);
    }

    private reloadDeliveryHideItems(
        deliveryHideItems: ReadonlyArray<IReadOnlyDeliveryHideSetting>,
        serviceMap: ReadonlyMap<ServiceKind, BackgroundServiceBase<IReadOnlyServiceSetting>>
    ) {
        this.reloadDeliveryHideItemsCore(deliveryHideItems, serviceMap);
    }

    private reloadDeliveryHideItemsCore(
        deliveryHideItems: ReadonlyArray<IReadOnlyDeliveryHideSetting>,
        serviceMap: ReadonlyMap<ServiceKind, BackgroundServiceBase<IReadOnlyServiceSetting>>
    ) {
        // async 使えるようにしてからやった方がいいわ
        this.logger.debug('TODO!');
    }

    private accept() {
        browser.runtime.onConnect.addListener(port => {
            this.logger.debug('connected client!');
            this.logger.dumpDebug(port);
            this.port = port;

            port.onMessage.addListener(rawMessage => {
                if (!this.port) {
                    return;
                }

                this.logger.debug('recv!');
                this.logger.debug(JSON.stringify(rawMessage));

                // 未調査: 自アドオンの接続だけ？
                const message = rawMessage as BridgeMeesage<IBridgeData>;

                switch (message.kind) {
                    case BridgeMeesageKind.notWordRequest:
                    case BridgeMeesageKind.hideRequest:
                        const serviceMessage = message as BridgeMeesage<IServiceBridgeData>;
                        const service = this.backgroundServiceMap.get(serviceMessage.data.service)!;
                        switch (serviceMessage.kind) {
                            case BridgeMeesageKind.notWordRequest:
                                service.receiveNotWordRequestMessage(this.port, serviceMessage);
                                break;

                            case BridgeMeesageKind.hideRequest:
                                service.receiveHideRequestMessage(this.port, message as BridgeMeesage<IHideRequestBridgeData>);
                                break;

                            default:
                                break;
                        }
                        break;

                    case BridgeMeesageKind.outputLog:
                        this.receiveOutputLogMessage(message as BridgeMeesage<IOutputLogBridgeData>);
                        break;

                    case BridgeMeesageKind.registerDeliveryHideRequest:
                        this.receiveRegisterDeliveryHideMessageAsync(message as BridgeMeesage<IRegisterDeliveryHideRequestData>);
                        break;
                }
            });
        });
    }

    private receiveOutputLogMessage(message: BridgeMeesage<IOutputLogBridgeData>): void {
        const clientLogger = new BridgeLoger(message.data.name);
        switch (message.data.logKind) {
            case LogKind.trace:
                clientLogger.trace(message.data.message);
                break;

            case LogKind.debug:
                clientLogger.debug(message.data.message);
                break;

            case LogKind.information:
                clientLogger.log(message.data.message);
                break;

            case LogKind.warning:
                clientLogger.warn(message.data.message);
                break;

            case LogKind.error:
                clientLogger.error(message.data.message);
                break;

            case LogKind.table:
                clientLogger.table(JSON.parse(message.data.message));
                break;

            default:
                throw new Exception(message);
        }
    }

    private async receiveRegisterDeliveryHideMessageAsync(message: BridgeMeesage<IRegisterDeliveryHideRequestData>): Promise<void> {

        const responseSender = (success: boolean, errorMessage: string) => {
            this.port!.postMessage(
                new BridgeMeesage(
                    BridgeMeesageKind.registerDeliveryHideResponse,
                    new RegisterDeliveryHideResponseData(message.data, success, errorMessage)
                )
            );
        };
            
        const successSender = () => {
            responseSender(true, '');
        };
        const errorSender = (errorMessage: string) => {
            responseSender(false, errorMessage);
        };

        const setting = new Setting();
        const mainSetting = await setting.loadMainSettingAsync();
        if(!mainSetting) {
            errorSender('mainSetting is null... :(');
            return;
        }

        if(mainSetting.deliveryHideItems.some(i => i.url === message.data.url)) {
            errorSender('exists url: ' + message.data.url);
            return;
        }

        this.logger.debug("import!");

        const result = await getDeliveryHideItemAsync(message.data.url);
        if (!result.success) {
            errorSender(result.message!);
            return;
        }

        const hideSetting = result.setting!;
        mainSetting.deliveryHideItems.push(hideSetting);
        await setting.mergeDeliverySettingAsync(hideSetting.url, result.lines!);
        await setting.saveMainSettingAsync(mainSetting, false);

        const deliverySetting: IReadOnlyDeliverySetting = {
            hideItems: {
                [hideSetting.url]: result.lines!,
            }
        };
        for (const service of this.backgroundServiceMap.values()) {
            service.importDeliveryHideItems([hideSetting], deliverySetting);
        }

        successSender();
    }

}

