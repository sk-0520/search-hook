import * as shared from './shared';
import * as conf from './conf';

export class Options extends shared.ActionBase {
    constructor() {
        super('Options');
    }

    public initialize() {
        document.querySelector('form')!.addEventListener('submit', this.save);
        
        document.querySelector('#command-engine-add-not-item')!.addEventListener('click', this.addNotItemFromInput);
        document.querySelector('#command-view-add-hide-item')!.addEventListener('click', this.addHideItemFromInput);

        this.restore();
    }

    private restore(): void {
        var getting = browser.storage.local.get('setting');
        getting.then(
            result => {
                var baseSetting = new conf.MainSetting();
                if(result.setting) {
                    var resultSetting = <conf.IMainSetting>(result['setting'] as any);
                    baseSetting = shared.merge(baseSetting, resultSetting);
                }
                alert(JSON.stringify(baseSetting));
                // if(!setting) {
                //     // init
                //     setting = baseSetting;
                // } else {
                //     setting = merge(baseSetting, setting);
                // }
                // setService(setting.service);
                // setNotItems(setting.notItems);
                // setHideItems(setting.hideItems);                
            },
            error => {
                alert("bbb");
                super.logger.error(error)
            }
        );
    }


    private save(): void {
    }

    private addNotItemFromInput():void {}
    private addHideItemFromInput():void {}
}
