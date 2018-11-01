import { LoggingBase, isNullOrEmpty, Exception } from '../share/common';
import { IService, ServiceKind } from '../share/define/service-kind';
import { IReadOnlyNotItemSetting } from '../share/setting/not-item-setting';
import { IReadOnlyServiceSetting } from '../share/setting/service-setting-base';
import { QueryBase } from '../share/query/query';
import { IReadOnlyHideItemSetting } from '../share/setting/hide-item-setting';
import { MatchKind } from '../share/define/match-kind';
import { BridgeMeesage } from '../share/bridge/bridge-meesage';
import { IServiceBridgeData, EraseBridgeData, IHideRequestBridgeData } from '../share/bridge/bridge-data';
import { BridgeMeesageKind } from '../share/define/bridge-meesage-kind';
import { IReadOnlyServiceEnabledSetting } from '../share/setting/service-enabled-setting';

/** Fxから持ってきた */
export interface IRequestDetails {
    requestId: string;
    url: string;
    method: string;
    frameId: number;
    parentFrameId: number;
    requestBody?: {
        error?: string;
        formData?: { [key: string]: string[] };
        raw?: browser.webRequest.UploadData[];
    };
    tabId: number;
    type: browser.webRequest.ResourceType;
    timeStamp: number;
    originUrl: string;
}

export interface ISettingItems {
    notItems: ReadonlyArray<IReadOnlyNotItemSetting>;
    hideItems: ReadonlyArray<IReadOnlyHideItemSetting>;
}

export abstract class BackgroundServiceBase<TReadOnlyServiceSetting extends IReadOnlyServiceSetting> extends LoggingBase implements IService {

    public abstract readonly service: ServiceKind;
    protected abstract readonly filter: browser.webRequest.RequestFilter;
    //abstract readonly extraInfoSpec?: Array<U>;

    private requestSet = new Set();
    protected setting: TReadOnlyServiceSetting;

    protected notItemWords: ReadonlyArray<string>;
    protected hideItems: ReadonlyArray<IReadOnlyHideItemSetting>;

    protected constructor(name: string, setting: TReadOnlyServiceSetting, settingItems: ISettingItems) {
        super(name);

        this.setting = setting;

        this.notItemWords = this.getEnabledNotItemWords(settingItems.notItems);
        this.hideItems = this.getEnabledHideItems(settingItems.hideItems);
    }

    protected checkService(setting: IReadOnlyServiceEnabledSetting) {
        switch (this.service) {
            case ServiceKind.google:
                return setting.google;

            case ServiceKind.bing:
                return setting.bing;

            default:
                throw new Exception(setting);
        }
    }

    protected getEnabledNotItemWords(notItems: ReadonlyArray<IReadOnlyNotItemSetting>): Array<string> {
        return notItems.filter(i => {
            return this.checkService(i.service);
        }).filter(i => {
            return !isNullOrEmpty(i.word);
        }).map(i => {
            return i.word;
        });
    }

    protected getEnabledHideItems(hideItems: ReadonlyArray<IReadOnlyHideItemSetting>): ReadonlyArray<IReadOnlyHideItemSetting> {
        return hideItems.filter(i => {
            return this.checkService(i.service);
        }).filter(i => {
            return !isNullOrEmpty(i.word);
        }).filter(i => {
            if (i.match.kind === MatchKind.regex) {
                try {
                    new RegExp(i.word);
                } catch (ex) {
                    this.logger.error(ex);
                    this.logger.dumpError(i);
                    return false;
                }
            }

            return true;
        });
    }

    protected abstract redirect(requestDetails: IRequestDetails, url: URL, notItemWords: ReadonlyArray<string>): browser.webRequest.BlockingResponse | undefined;

    public registerRedirect(): void {
        browser.webRequest.onBeforeRequest.addListener(
            requestDetails => {
                this.logger.log('loading: ' + requestDetails.url);
                this.logger.dumpDebug(requestDetails);

                if (!this.setting.enabled) {
                    this.logger.debug(`disabled ${this.service}`);
                    return;
                }
                this.logger.debug(`enabled ${this.service}`);

                if (this.requestSet.has(requestDetails.requestId)) {
                    this.logger.debug('setted request: ' + requestDetails.requestId);
                    this.requestSet.delete(requestDetails.requestId);
                    return;
                }
                this.requestSet.add(requestDetails.requestId);
                const url = new URL(requestDetails.url);

                return this.redirect(requestDetails, url, this.notItemWords);
            },
            this.filter,
            ['blocking'] // このアプリケーションはこれしか使わん
        );

    }

    protected tuneSearchWord(word: string, query: QueryBase): string {
        this.logger.debug('raw: ' + word);
        const queryItems = query.split(word);
        this.logger.debug('items: ' + queryItems);

        const customQuery = query.addNotItemWords(queryItems, this.notItemWords);
        this.logger.debug('customQuery: ' + JSON.stringify(customQuery));

        const queryString = query.toString(customQuery.users.concat(customQuery.applications));
        this.logger.debug('queryString: ' + queryString);

        return queryString;
    }

    public receiveServiceMessage(port: browser.runtime.Port, message: BridgeMeesage<IServiceBridgeData>) {
        /*
        port.postMessage(
            new BridgeMeesage(
                BridgeMeesageKind.items,
                new ItemsBridgeData(
                    this.setting.enabled,
                    this.hideItems
                )
            )
        );
        */

        port.postMessage(
            new BridgeMeesage(
                BridgeMeesageKind.erase,
                new EraseBridgeData(
                    this.setting.enabled,
                    this.notItemWords
                )
            )
        );
    }

    public receiveHideResponseMessage(port: browser.runtime.Port, message: BridgeMeesage<IHideRequestBridgeData>): any {
        this.logger.dumpDebug(message);
    }

}
