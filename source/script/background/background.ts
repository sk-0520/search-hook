import * as shared from '../shared';
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

        //resistView(setting, {});
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
    
}


