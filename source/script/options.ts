import * as shared from './shared';
import * as setting from './setting';

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
                var baseSetting = new setting.MainSetting();
                if(!result.setting) {
                } else {
                    var resultSetting = <setting.MainSetting>(result['setting']);
                    baseSetting = shared.merge(baseSetting, resultSetting);
                }
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
