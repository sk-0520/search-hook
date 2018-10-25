import * as shared from '../share/common';
import { convertMatchKind } from '../share/define/match-kind';
import { HideItemSetting } from '../share/setting/hide-item-setting';
import { IMainSetting, MainSetting } from '../share/setting/main-setting';
import { NotItemSetting } from '../share/setting/not-item-setting';
import { ServiceManagerSetting } from '../share/setting/service-manager-setting';
import { BingServiceSetting } from '../share/setting/service-setting-bing';
import { GoogleServiceSetting } from '../share/setting/service-setting-google';

export default class Options extends shared.ActionBase {
    constructor() {
        super('Options');
    }

    public initialize() {
        document.querySelector('form')!.addEventListener('submit', e => this.save(e));

        document.querySelector('#command-engine-add-not-item')!.addEventListener(
            'click',
            e => this.addNotItemFromInput(e)
        );
        document.querySelector('#command-view-add-hide-item')!.addEventListener(
            'click',
            e => this.addHideItemFromInput(e)
        );

        this.restore();
    }

    private restore(): void {
        const getting = browser.storage.local.get('setting');
        getting.then(
            result => this.restoreCore(result),
            error => {
                alert("bbb");
                this.logger.error(error);
            }
        );
    }

    private restoreCore(result: browser.storage.StorageObject) {
        let baseSetting = new MainSetting();
        if (result.setting) {
            const resultSetting = (result.setting as any) as IMainSetting;
            baseSetting = shared.merge(baseSetting, resultSetting);
        }

        this.logger.debug(JSON.stringify(baseSetting));

        this.setService(baseSetting.service);
        this.setNotItems(baseSetting.notItems);

        this.setHideItems(baseSetting.hideItems);

    }

    private setService(setting: ServiceManagerSetting) {
        function setGoogle(googleSetting: GoogleServiceSetting) {
            (document.querySelector('#service-is-enabled-google') as HTMLInputElement).checked = googleSetting.enabled;
            (document.querySelector('#service-google-search-count') as HTMLInputElement).value = String(googleSetting.searchCount);
            (document.querySelector('#service-google-search-safe') as HTMLInputElement).checked = googleSetting.searchSafe;
        }

        function setBing(bingSetting: BingServiceSetting) {
            (document.querySelector('#service-is-enabled-bing') as HTMLInputElement).checked = bingSetting.enabled;
            //document.querySelector('#service-bing-search-count').value = bingSetting.searchCount;
        }

        setGoogle(setting.google);
        setBing(setting.bing);
    }

    private setNotItems(setting: Array<NotItemSetting>) {
        const parentElement = this.getNotItemParentElement();
        for (const item of setting) {
            this.addNotItemCore(parentElement, item);
        }
    }

    private addNotItemCore(parent: HTMLInputElement, item: NotItemSetting) {
        const groupElement = document.createElement('tr');

        const wordInputElement = document.createElement('input');
        wordInputElement.setAttribute('type', 'text');
        wordInputElement.setAttribute('name', 'engine-not-item-word');
        wordInputElement.value = item.word;
        const wordElement = document.createElement('td');
        wordElement.appendChild(wordInputElement);

        const serviceElementCreator = (displayValue: string, elementName: string, isChecked: boolean) => {
            const check = document.createElement('input');
            check.setAttribute('type', 'checkbox');
            check.setAttribute('name', elementName);
            check.checked = isChecked;

            const label = document.createElement('label');
            label.appendChild(check);
            label.appendChild(document.createTextNode(displayValue));

            const li = document.createElement('li');
            li.appendChild(label);

            return li;
        };
        const serviceGroupElement = document.createElement('ul');
        serviceGroupElement.className = 'horizontal';
        serviceGroupElement.appendChild(serviceElementCreator('google', 'engine-not-item-service-google', item.service.google));
        serviceGroupElement.appendChild(serviceElementCreator('bing', 'engine-not-item-service-bing', item.service.bing));

        const serviceElement = document.createElement('td');
        serviceElement.appendChild(serviceGroupElement);

        const removeCommandElement = document.createElement('button');
        removeCommandElement.appendChild(document.createTextNode('remove'));
        removeCommandElement.addEventListener('click', e => {
            e.preventDefault();

            groupElement.remove();
        });
        const removeElement = document.createElement('td');
        removeElement.appendChild(removeCommandElement);

        groupElement.appendChild(wordElement);
        groupElement.appendChild(serviceElement);
        groupElement.appendChild(removeElement);

        parent.appendChild(groupElement);
    }

    private getService(): ServiceManagerSetting {

        const setting = new ServiceManagerSetting();
        setting.google.enabled = (document.querySelector('#service-is-enabled-google') as HTMLInputElement).checked,
            setting.google.searchCount = Number((document.querySelector('#service-google-search-count') as HTMLInputElement).value);
        setting.google.searchSafe = (document.querySelector('#service-google-search-safe') as HTMLInputElement).checked;

        setting.bing.enabled = (document.querySelector('#service-is-enabled-bing') as HTMLInputElement)!.checked;

        return setting;
    }

    private getNotItemParentElement(): HTMLInputElement {
        return document.querySelector('#engine-not-word-list') as HTMLInputElement;
    }

    private getNotItems(): Array<NotItemSetting> {
        const parentElement = this.getNotItemParentElement();

        const children = parentElement.querySelectorAll('tr');
        this.logger.debug(`child: ${children.length}`);

        const result = new Array<NotItemSetting>();

        for (const child of children) {

            const word = (child.querySelector('[name=engine-not-item-word]') as HTMLInputElement).value;
            if (!word || !word.length || !word.trim().length) {
                this.logger.debug('ignore: empty word');
                continue;
            }

            const item = new NotItemSetting();
            item.word = word;
            item.service.google = (child.querySelector('[name=engine-not-item-service-google]') as HTMLInputElement).checked;
            item.service.bing = (child.querySelector('[name=engine-not-item-service-bing]') as HTMLInputElement).checked;

            result.push(item);
        }

        return result;
    }

    private getHideItemParentElement(): HTMLInputElement {
        return document.querySelector('#view-hide-host-list') as HTMLInputElement;
    }

    private getHideItems(): Array<HideItemSetting> {
        const parentElement = this.getHideItemParentElement();

        const children = parentElement.querySelectorAll('tr');
        this.logger.debug(`child: ${children.length}`);

        const result = Array<HideItemSetting>();

        for (const child of children) {

            const word = (child.querySelector('[name=view-hide-item-host]') as HTMLInputElement).value;
            if (!word || !word.length || !word.trim().length) {
                this.logger.debug('ignore: empty word');
                continue;
            }

            const item = new HideItemSetting();
            item.word = word;
            item.service.google = (child.querySelector('[name=view-hide-item-service-google]') as HTMLInputElement).checked;
            item.service.bing = (child.querySelector('[name=view-hide-item-service-bing]') as HTMLInputElement).checked;
            item.match.kind = convertMatchKind((child.querySelector('[name=view-hide-item-match-kind]') as HTMLInputElement).value);
            item.match.case = (child.querySelector('[name=view-hide-item-match-case]') as HTMLInputElement).checked,

            result.push(item);
        }

        return result;
    }

    private save(e: Event): void {
        e.preventDefault();

        const setting = new MainSetting();
        setting.service = this.getService();
        setting.notItems = this.getNotItems();
        setting.hideItems = this.getHideItems();

        browser.storage.local.set({
            setting: setting as any
        }).then(
            result => {
                browser.runtime.reload();
            },
            error => {
                this.logger.error(error);
            }
        );
    }

    private addNotItemFromInput(e: Event) {
        e.preventDefault();

        const item = new NotItemSetting();

        item.word = (document.querySelector('#engine-input-not-word') as HTMLInputElement).value;
        item.service.google = (document.querySelector('#engine-input-is-enabled-google') as HTMLInputElement).checked;
        item.service.bing = (document.querySelector('#engine-input-is-enabled-bing') as HTMLInputElement).checked;

        this.logger.debug(JSON.stringify(item));
        this.addNotItem(item);

        (document.querySelector('#engine-input-not-word') as HTMLInputElement).value = '';
        (document.querySelector('#engine-input-is-enabled-google') as HTMLInputElement).checked = true;
        (document.querySelector('#engine-input-is-enabled-bing') as HTMLInputElement).checked = true;
    }

    private addHideItemFromInput(e: Event): void {
        e.preventDefault();

        const item = new HideItemSetting();
        item.word = (document.querySelector('#view-input-hide-host') as HTMLInputElement).value;
        item.match.kind = convertMatchKind((document.querySelector('#view-input-hide-match-kind') as HTMLInputElement).value);
        item.match.case = (document.querySelector('#view-input-hide-match-case') as HTMLInputElement).checked;
        item.service.google = (document.querySelector('#view-input-is-enabled-google') as HTMLInputElement).checked;
        item.service.bing = (document.querySelector('#view-input-is-enabled-bing') as HTMLInputElement).checked;

        this.logger.debug(JSON.stringify(item));
        this.addHideItem(item);

        (document.querySelector('#view-input-hide-host') as HTMLInputElement).value = '';
        (document.querySelector('#view-input-is-enabled-google') as HTMLInputElement).checked = true;
        (document.querySelector('#view-input-is-enabled-bing') as HTMLInputElement).checked = true;
    }

    private addHideItem(item: HideItemSetting) {
        this.addHideItemCore(this.getHideItemParentElement(), item);
    }

    private addNotItem(item: NotItemSetting) {
        this.addNotItemCore(this.getNotItemParentElement(), item);
    }

    private setHideItems(setting: Array<HideItemSetting>) {
        const parentElement = this.getHideItemParentElement();
        for (const item of setting) {
            this.addHideItemCore(parentElement, item);
        }
    }

    private addHideItemCore(parent: HTMLElement, item: HideItemSetting) {
        const groupElement = document.createElement('tr');

        const wordInputElement = document.createElement('input');
        wordInputElement.setAttribute('type', 'text');
        wordInputElement.setAttribute('name', 'view-hide-item-host');
        wordInputElement.value = item.word;
        const wordElement = document.createElement('td');
        wordElement.appendChild(wordInputElement);

        const matchKindElement = document.createElement('select');
        matchKindElement.setAttribute('name', 'view-hide-item-match-kind');
        const matchElementCreator = (displayValue: string, elementValue: string) => {
            const option = document.createElement('option');
            option.setAttribute('value', elementValue);
            option.appendChild(document.createTextNode(displayValue));

            return option;
        };
        matchKindElement.appendChild(matchElementCreator('partial', 'partial'));
        matchKindElement.appendChild(matchElementCreator('forward', 'forward'));
        matchKindElement.appendChild(matchElementCreator('perfect', 'perfect'));
        matchKindElement.appendChild(matchElementCreator('regex', 'regex'));
        matchKindElement.value = item.match.kind;

        const matchKindItemElement = document.createElement('li');
        matchKindItemElement.appendChild(matchKindElement);

        const matchCaseCheckElement = document.createElement('input');
        matchCaseCheckElement.setAttribute('name', 'view-hide-item-match-case');
        matchCaseCheckElement.setAttribute('type', 'checkbox');
        matchCaseCheckElement.checked = item.match.case;

        const matchCaseLabelElement = document.createElement('label');
        matchCaseLabelElement.appendChild(matchCaseCheckElement);
        matchCaseLabelElement.appendChild(document.createTextNode('case'));

        const matchCaseItemElement = document.createElement('li');
        matchCaseItemElement.appendChild(matchCaseLabelElement);

        const matchGroupElement = document.createElement('ul');
        matchGroupElement.className = 'horizontal';
        matchGroupElement.appendChild(matchKindItemElement);
        matchGroupElement.appendChild(matchCaseItemElement);

        const matchElement = document.createElement('td');
        matchElement.appendChild(matchGroupElement);

        const serviceElementCreator = (displayValue: string, elementName: string, isChecked: boolean) => {
            const check = document.createElement('input');
            check.setAttribute('type', 'checkbox');
            check.setAttribute('name', elementName);
            check.checked = isChecked;

            const label = document.createElement('label');
            label.appendChild(check);
            label.appendChild(document.createTextNode(displayValue));

            const li = document.createElement('li');
            li.appendChild(label);

            return li;
        };
        const serviceGroupElement = document.createElement('ul');
        serviceGroupElement.className = 'horizontal';
        serviceGroupElement.appendChild(serviceElementCreator('google', 'view-hide-item-service-google', item.service.google));
        serviceGroupElement.appendChild(serviceElementCreator('bing', 'view-hide-item-service-bing', item.service.bing));

        const serviceGroupWrapperElement = document.createElement('form');
        serviceGroupWrapperElement.appendChild(serviceGroupElement);

        const serviceElement = document.createElement('td');
        serviceElement.appendChild(serviceGroupWrapperElement);

        const removeCommandElement = document.createElement('button');
        removeCommandElement.appendChild(document.createTextNode('remove'));
        removeCommandElement.addEventListener('click', e => {
            e.preventDefault();

            groupElement.remove();
        });
        const removeElement = document.createElement('td');
        removeElement.appendChild(removeCommandElement);

        groupElement.appendChild(wordElement);
        groupElement.appendChild(matchElement);
        groupElement.appendChild(serviceElement);
        groupElement.appendChild(removeElement);

        parent.appendChild(groupElement);
    }

}
