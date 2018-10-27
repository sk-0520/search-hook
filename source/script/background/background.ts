import { Setting } from '../browser/setting';
import { EraseBridgeData, IServiceBridgeData, ItemsBridgeData } from '../share/bridge/bridge-data';
import { BridgeMeesage } from '../share/bridge/bridge-meesage';
import { ActionBase } from '../share/common';
import { BridgeMeesageKind } from '../share/define/bridge-meesage-kind';
import { ServiceKind } from '../share/define/service-kind';
import { IMainSetting } from '../share/setting/main-setting';
import BackgroundServiceBing from './background-service-bing';
import BackgroundServiceGoogle from './background-service-google';
import { BackgroundServiceBase, ISettingItems } from './background-service';
import { IReadOnlyServiceSetting } from '../share/setting/service-setting-base';

export default class Background extends ActionBase {

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

        const settingItems:ISettingItems = {
            notItems: setting.notItems,
            hideItems: setting.hideItems,
        }
        this.backgroundServiceMap.set(ServiceKind.google, new BackgroundServiceGoogle(setting.service.google, settingItems))
        this.backgroundServiceMap.set(ServiceKind.bing, new BackgroundServiceBing(setting.service.google, settingItems));

        for (const [key, service] of this.backgroundServiceMap) {
            this.logger.debug(`build service ${key}`);
            service.registerRedirect();
        }

        this.resistView(setting);
    }

    private filterNotItems(service: ServiceKind, setting: IMainSetting): Array<string> {
        this.logger.log(service);

        const notItems = setting.notItems.filter(i => {
            switch (service) {
                case ServiceKind.google:
                    return i.service.google;

                case ServiceKind.bing:
                    return i.service.bing;

                default:
                    throw { error: i };
            }
        }).filter(i => {
            return i.word.length;
        }).map(i => {
            return i.word;
        });

        return notItems;
    }

    private resistView(setting: IMainSetting) {

        // 比較関数だけ作っておきたかったけど転送できない
        const enabledItems = setting.hideItems.filter(i => {
            return i.word && i.word.length;
        }).filter(i => {
            if (i.match.kind === 'regex') {
                try {
                    new RegExp(i.word);
                } catch (ex) {
                    this.logger.error(JSON.stringify(i));
                    this.logger.error(ex);
                    return false;
                }
            }

            return true;
        });

        const googleHideItems = enabledItems.filter(i => {
            return i.service.google;
        });
        const bingHideItems = enabledItems.filter(i => {
            return i.service.bing;
        });

        this.logger.debug('googleHideItems.length: ' + googleHideItems.length);
        this.logger.debug('bingHideItems.length: ' + bingHideItems.length);

        browser.runtime.onConnect.addListener(port => {
            this.logger.debug('connected content!');
            this.logger.debug(JSON.stringify(port));

            port.onMessage.addListener(rawMessage => {
                this.logger.debug('send!');
                this.logger.debug(JSON.stringify(rawMessage));

                const message = rawMessage as BridgeMeesage<IServiceBridgeData>;

                switch (message.data.service) {
                    case ServiceKind.google:
                        port.postMessage(
                            new BridgeMeesage(
                                BridgeMeesageKind.items,
                                new ItemsBridgeData(
                                    setting.service.google.enabled,
                                    googleHideItems
                                )
                            )
                        );
                        port.postMessage(
                            new BridgeMeesage(
                                BridgeMeesageKind.erase,
                                new EraseBridgeData(
                                    setting.service.google.enabled,
                                    this.filterNotItems(ServiceKind.google, setting)
                                )
                            )
                        );
                        break;

                    case ServiceKind.bing:
                        port.postMessage(
                            new BridgeMeesage(
                                BridgeMeesageKind.items,
                                new ItemsBridgeData(
                                    setting.service.bing.enabled,
                                    bingHideItems
                                )
                            )
                        );
                        port.postMessage(
                            new BridgeMeesage(
                                BridgeMeesageKind.erase,
                                new EraseBridgeData(
                                    setting.service.bing.enabled,
                                    this.filterNotItems(ServiceKind.bing, setting)
                                )
                            )
                        );
                        break;

                    default:
                        this.logger.log('unknown service');
                }
            });
        });
    }

}

