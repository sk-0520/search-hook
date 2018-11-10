import { getDeliveryHideItemAsync, DeliveryHideItemConverter } from '../browser/delivery-hide-item';
import { Setting } from '../browser/setting';
import { IBridgeData, IHideRequestBridgeData, IOutputLogBridgeData, IRegisterDeliveryHideRequestData, IServiceBridgeData, RegisterDeliveryHideResponseData } from '../share/bridge/bridge-data';
import { BridgeMeesage } from '../share/bridge/bridge-meesage';
import { ActionBase, Exception, isNullOrEmpty } from '../share/common';
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
import { HideItemStocker } from './hide-item-stocker';
import { MatchKind } from '../share/define/match-kind';
import { IReadOnlyHideItemSetting } from '../share/setting/hide-item-setting';

export default class Background extends ActionBase {

    protected port?: browser.runtime.Port;
    private backgroundServiceMap = new Map<ServiceKind, BackgroundServiceBase<IReadOnlyServiceSetting>>();
    private hideItemStocker = new HideItemStocker();

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

        const hideItems = this.getEnabledHideItems(mainSetting.hideItems);
        this.hideItemStocker.importHideItems(HideItemStocker.applicationKey, hideItems);

        const settingItems: ISettingItems = {
            notItems: mainSetting.notItems,
        };
        this.backgroundServiceMap.set(ServiceKind.google, new BackgroundServiceGoogle(mainSetting.service.google, settingItems, this.hideItemStocker));
        this.backgroundServiceMap.set(ServiceKind.bing, new BackgroundServiceBing(mainSetting.service.bing, settingItems, this.hideItemStocker));

        this.buildDeliverySetting(mainSetting.deliveryHideItems, deliverySetting, this.backgroundServiceMap);

        for (const [key, service] of this.backgroundServiceMap) {
            this.logger.debug(`build service ${key}`);
            service.registerRedirect();
        }

        this.accept();
    }

    private getEnabledHideItems(hideItems: ReadonlyArray<IReadOnlyHideItemSetting>): ReadonlyArray<IReadOnlyHideItemSetting> {
        return hideItems.filter(i => {
            return !isNullOrEmpty(i.word);
        }).filter(i => {
            if (i.match.kind === MatchKind.regex) {
                try {
                    new RegExp(i.word);
                } catch (ex) {
                    this.logger.error(ex);
                    this.logger.dumpError(i);
                    return false;
                }
            }

            return true;
        });
    }
    private buildDeliverySetting(
        deliveryHideItems: ReadonlyArray<IReadOnlyDeliveryHideSetting>,
        deliverySetting: IReadOnlyDeliverySetting,
        serviceMap: ReadonlyMap<ServiceKind, BackgroundServiceBase<IReadOnlyServiceSetting>>
    ): void {
        const converter = new DeliveryHideItemConverter();
        for(const deliveryHideItem of deliveryHideItems) {
            const deliveryHideLines = deliverySetting.hideItems[deliveryHideItem.url];
            if(!deliveryHideItems) {
                continue;
            }
            const hideItems = converter.convertItems(deliveryHideLines!, deliveryHideItem.service);
            const enabledHideItems = this.getEnabledHideItems(hideItems);

            this.hideItemStocker.importHideItems(deliveryHideItem.url, enabledHideItems);
        }

        // 適当に更新する, TODO: タイミング等々の整理
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
            errorSender('MainSetting is null... :(');
            return;
        }

        this.logger.debug("import!");

        const result = await getDeliveryHideItemAsync(message.data.url);
        if (!result.success) {
            errorSender(result.message!);
            return;
        }

        // 既に存在するなら削除
        const existsIndex = mainSetting.deliveryHideItems.findIndex(i => i.url === message.data.url);
        if(existsIndex !== -1) {
            mainSetting.deliveryHideItems.splice(existsIndex, 1);
        }

        const hideSetting = result.setting!;
        mainSetting.deliveryHideItems.push(hideSetting);
        await setting.mergeDeliverySettingAsync(hideSetting.url, result.lines!);
        await setting.saveMainSettingAsync(mainSetting, false);

        const converter = new DeliveryHideItemConverter();
        const hideItems = converter.convertItems(result.lines!, hideSetting.service);
        const enabledHideItems = this.getEnabledHideItems(hideItems);

        this.hideItemStocker.importHideItems(hideSetting.url, enabledHideItems);

        successSender();
    }

}

