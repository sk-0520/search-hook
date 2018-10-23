import * as shared from '../share/common';
import * as conf from '../conf';
import BackgroundGoogle from './background-google';
import BackgroundBingService from './background-bing';

export default class Background extends shared.ActionBase {
    constructor() {
        super('Background');
    }

    public initialize() {
        this.loadSetting();
    }

    private loadSetting(){
        browser.storage.local.get('setting').then(
            result => this.loadSettingCore(result),
            error => this.logger.error(error)
        );
    }

    private loadSettingCore(result: browser.storage.StorageObject) {
        this.logger.log("setting loading");
        const setting = <conf.IMainSetting>(result.setting as any);

        if(!setting) {
            this.logger.log('setting empty');
            return;
        }

        this.logger.log('setting loaded');
        this.logger.debug(JSON.stringify(setting));

        new BackgroundGoogle().resistRedirectGoogle(setting, this.filterNotItems(shared.ServiceKind.google, setting));
        new BackgroundBingService().resistRedirectBing(setting, this.filterNotItems(shared.ServiceKind.bing, setting));

        //resistRedirectGoogle(setting, filterNotItems(ServiceKind_Google, setting));
        //resistRedirectBing(setting, filterNotItems(ServiceKind_Bing, setting));

        this.resistView(setting);
    }

    private filterNotItems(service:shared.ServiceKind, setting:conf.IMainSetting): Array<string> {
        this.logger.log(service);
    
        var notItems = setting.notItems.filter(function(i) {
            switch(service) {
                case shared.ServiceKind.google:
                    return i.service.google;
    
                case shared.ServiceKind.bing:
                    return i.service.bing;
    
                default:
                    throw { error: i };
            }
        }).filter(function(i) {
            return i.word.length;
        }).map(function(i) {
            return i.word;
        });
    
        return notItems;
    }

    private resistView(setting: conf.IMainSetting) {

        // 比較関数だけ作っておきたかったけど転送できない
        var enabledItems = setting.hideItems.filter(i => {
            return i.word && i.word.length
        }).filter(i => {
            if(i.match.kind === 'regex') {
                try {
                    new RegExp(i.word)
                } catch(ex) {
                    this.logger.error(JSON.stringify(i));
                    this.logger.error(ex);
                    return false;
                }
            }
    
            return true;
        });
    
        var googleHideItems = enabledItems.filter(i => {
            return i.service.google;
        });
        var bingHideItems = enabledItems.filter(i => {
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
    
                var message = <shared.BridgeMeesage<shared.ServiceBridgeData>>rawMessage;

                switch(message.data.service) {
                    case shared.ServiceKind.google:
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
                                    this.filterNotItems(shared.ServiceKind.google, setting)
                                )
                            )
                        )
                        break;
    
                    case shared.ServiceKind.bing:
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
                                    this.filterNotItems(shared.ServiceKind.bing, setting)
                                )
                            )
                        )


                        break;
    
                    default:
                        this.logger.log('unknown service');
                }
            });
        });
    }
    
}


