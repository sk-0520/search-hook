import * as shared from './shared';
import * as conf from './conf';

export class Options extends shared.ActionBase {
    constructor() {
        super('Options');
    }

    public initialize() {
        document.querySelector('form')!.addEventListener('submit', e => this.save(e));
        
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
        alert("++" + JSON.stringify(baseSetting))
            
                this.setService(baseSetting.service);
                // setNotItems(setting.notItems);
                // setHideItems(setting.hideItems);                
            },
            error => {
                alert("bbb");
                this.logger.error(error)
            }
        );
    }

    private setService(setting: conf.ServiceSetting) {
        function setGoogle(googleSetting: conf.GoogleServiceSetting) {
            (document.querySelector('#service-is-enabled-google') as HTMLInputElement).checked = googleSetting.enabled;
            (document.querySelector('#service-google-search-count') as HTMLInputElement).value = String(googleSetting.searchCount);
            (document.querySelector('#service-google-search-safe') as HTMLInputElement).checked = googleSetting.searchSafe;
        }
    
        function setBing(bingSetting: conf.BingServiceSetting) {
            (document.querySelector('#service-is-enabled-bing') as HTMLInputElement).checked = bingSetting.enabled;
            //document.querySelector('#service-bing-search-count').value = bingSetting.searchCount;
        }
    
        setGoogle(setting.google);
        setBing(setting.bing);

        alert("@" + JSON.stringify(setting))
    }

    private getService(): conf.ServiceSetting {

        var setting = new conf.ServiceSetting();
        setting.google.enabled = (document.querySelector('#service-is-enabled-google') as HTMLInputElement).checked,
        setting.google.searchCount = Number((document.querySelector('#service-google-search-count') as HTMLInputElement).value);
        setting.google.searchSafe = (document.querySelector('#service-google-search-safe') as HTMLInputElement).checked;

        setting.bing.enabled = (document.querySelector('#service-is-enabled-bing') as HTMLInputElement)!.checked;

        return setting;
    }

    private getNotItemParentElement(): HTMLInputElement {
        return document.querySelector('#engine-not-word-list') as HTMLInputElement;
    }
    
    private getNotItems(): Array<conf.NotItemSetting> {
        const parentElement = this.getNotItemParentElement();
    
        const children = parentElement.querySelectorAll('tr');
        this.logger.debug(`child: ${children.length}`);
    
        var result = new Array<conf.NotItemSetting>();
    
        for(var i = 0; i < children.length; i++) {
            const child = children[i];
    
            var word = (child.querySelector('[name=engine-not-item-word]') as HTMLInputElement).value;
            if(!word || !word.length || !word.trim().length) {
                this.logger.debug('ignore: empty word');
                continue;
            }
    
            var item = new conf.NotItemSetting();
            item.word = word;
            item.service.google = (child.querySelector('[name=engine-not-item-service-google]') as HTMLInputElement).checked;
            item.service.bing = (child.querySelector('[name=engine-not-item-service-bing]') as HTMLInputElement).checked;

            result.push(item);
        }
    
    
        return result;
    }
    
    private getHideItemParentElement(): HTMLInputElement{
        return document.querySelector('#view-hide-host-list') as HTMLInputElement;
    }

    private getHideItems(): Array<conf.HiddenItemSetting> {
        const parentElement = this.getHideItemParentElement();
    
        const children = parentElement.querySelectorAll('tr');
        this.logger.debug(`child: ${children.length}`);
    
        var result = Array<conf.HiddenItemSetting>();
    
        for(var i = 0; i < children.length; i++) {
            const child = children[i];
    
            var word = (child.querySelector('[name=view-hide-item-host]') as HTMLInputElement).value;
            if(!word || !word.length || !word.trim().length) {
                this.logger.debug('ignore: empty word');
                continue;
            }

            var item = new conf.HiddenItemSetting();
            item.word = word;
            item.service.google = (child.querySelector('[name=view-hide-item-service-google]') as HTMLInputElement).checked;
            item.service.google = (child.querySelector('[name=view-hide-item-service-bing]') as HTMLInputElement).checked;
            item.match.kind = conf.convertMatchKind((child.querySelector('[name=view-hide-item-match-kind]') as HTMLInputElement).value);
            item.match.case = (child.querySelector('[name=view-hide-item-match-case]')as HTMLInputElement).checked,
    
            result.push(item);
        }
    
    
        return result;
    }
    

    private save(e: Event): void {
        e.preventDefault();

        var service = this.getService();
        alert(JSON.stringify(service))
        var notItems = this.getNotItems();
        alert(JSON.stringify(notItems))
        var hidenItems = this.getHideItems();
        alert(JSON.stringify(hidenItems))

        var setting = new conf.MainSetting();
        setting.service =  this.getService();
        setting.notItems =  this.getNotItems();
        setting.hideItems =  this.getHideItems();

        alert('aaaaaaaaaaaa' + JSON.stringify(setting));

        browser.storage.local.set({
            'setting': setting as any
        }).then(
            result => {
                browser.runtime.reload();
            },
            error => {
                this.logger.error(error);
            }
        );
    }

    private addNotItemFromInput():void {}
    private addHideItemFromInput():void {}
}
