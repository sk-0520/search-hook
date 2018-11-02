import { Setting } from '../browser/setting';
import { IBridgeData, IHideRequestBridgeData, IOutputLogBridgeData, IServiceBridgeData } from '../share/bridge/bridge-data';
import { BridgeMeesage } from '../share/bridge/bridge-meesage';
import { ActionBase, Exception } from '../share/common';
import { BridgeMeesageKind } from '../share/define/bridge-meesage-kind';
import { ServiceKind } from '../share/define/service-kind';
import { LogKind } from '../share/logger';
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
        return setting.loadMainSettingAsync().then(
            result => this.startBackground(setting.tuneMainSetting(result)),
            error => this.logger.dumpError(error)
        );
    }

    private startBackground(setting: IMainSetting) {
        this.logger.log('start');
        this.logger.debug(JSON.stringify(setting));

        const settingItems: ISettingItems = {
            notItems: setting.notItems,
            hideItems: setting.hideItems,
        };
        this.backgroundServiceMap.set(ServiceKind.google, new BackgroundServiceGoogle(setting.service.google, settingItems));
        this.backgroundServiceMap.set(ServiceKind.bing, new BackgroundServiceBing(setting.service.google, settingItems));

        for (const [key, service] of this.backgroundServiceMap) {
            this.logger.debug(`build service ${key}`);
            service.registerRedirect();
        }

        this.accept();
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

}

