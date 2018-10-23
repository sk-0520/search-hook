import * as conf from '../conf';
import * as shared from '../share/common';
import { ServiceKind } from '../share/service-kind';
import BackgroundBingService from './background-bing';
import BackgroundGoogle from './background-google';

export default class Background extends shared.ActionBase {
    constructor() {
        super('Background');
    }

    public initialize() {
        this.loadSetting();
    }

    private loadSetting() {
        browser.storage.local.get('setting').then(
            result => this.loadSettingCore(result),
            error => this.logger.error(error)
        );
    }

    private loadSettingCore(result: browser.storage.StorageObject) {
        this.logger.log("setting loading");
        const setting = (result.setting as any) as conf.IMainSetting;

        if(!setting) {
            this.logger.log('setting empty');
            return;
        }

        this.logger.log('setting loaded');
        this.logger.debug(JSON.stringify(setting));

        new BackgroundGoogle().resistRedirectGoogle(setting, this.filterNotItems(ServiceKind.google, setting));
        new BackgroundBingService().resistRedirectBing(setting, this.filterNotItems(ServiceKind.bing, setting));

        //resistRedirectGoogle(setting, filterNotItems(ServiceKind_Google, setting));
        //resistRedirectBing(setting, filterNotItems(ServiceKind_Bing, setting));

        this.resistView(setting);
    }

    private filterNotItems(service: ServiceKind, setting: conf.IMainSetting): Array<string> {
        this.logger.log(service);
    
        const notItems = setting.notItems.filter(i => {
            switch(service) {
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

    private resistView(setting: conf.IMainSetting) {

        // 比較関数だけ作っておきたかったけど転送できない
        const enabledItems = setting.hideItems.filter(i => {
            return i.word && i.word.length;
        }).filter(i => {
            if(i.match.kind === 'regex') {
                try {
                    new RegExp(i.word);
                } catch(ex) {
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
    
                const message = rawMessage as shared.BridgeMeesage<shared.ServiceBridgeData>;

                switch(message.data.service) {
                    case ServiceKind.google:
                        port.postMessage(
                            new shared.BridgeMeesage(
                                shared.BridgeMeesageKind.items, 
                                new shared.ItemsBridgeData(
                                    setting.service.google.enabled,
                                    googleHideItems
                                )
                            )
                        );
                        port.postMessage(
                            new shared.BridgeMeesage(
                                shared.BridgeMeesageKind.erase, 
                                new shared.EraseBridgeData(
                                    setting.service.google.enabled,
                                    this.filterNotItems(ServiceKind.google, setting)
                                )
                            )
                        );
                        break;
    
                    case ServiceKind.bing:
                        port.postMessage(
                            new shared.BridgeMeesage(
                                shared.BridgeMeesageKind.items, 
                                new shared.ItemsBridgeData(
                                    setting.service.bing.enabled,
                                    bingHideItems
                                )
                            )
                        );
                        port.postMessage(
                            new shared.BridgeMeesage(
                                shared.BridgeMeesageKind.erase, 
                                new shared.EraseBridgeData(
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
