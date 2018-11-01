import { Setting } from '../browser/setting';
import { IHideRequestBridgeData, IBridgeData } from '../share/bridge/bridge-data';
import { BridgeMeesage } from '../share/bridge/bridge-meesage';
import { ActionBase } from '../share/common';
import { ServiceKind } from '../share/define/service-kind';
import { IMainSetting } from '../share/setting/main-setting';
import { IReadOnlyServiceSetting } from '../share/setting/service-setting-base';
import { BackgroundServiceBase, ISettingItems } from './background-service';
import BackgroundServiceBing from './background-service-bing';
import BackgroundServiceGoogle from './background-service-google';
import { BridgeMeesageKind } from '../share/define/bridge-meesage-kind';

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
                const service = this.backgroundServiceMap.get(message.data.service)!;

                switch (message.kind) {
                    case BridgeMeesageKind.notWordRequest:
                        service.receiveNotWordRequestMessage(this.port, message);
                        break;

                    case BridgeMeesageKind.hideRequest:
                this.logger.debug('!!!!!!!!!!!!!!!!!!');
                service.receiveHideRequestMessage(this.port, message as BridgeMeesage<IHideRequestBridgeData>);
                        break;
                }

            });
        });
    }
}

