import { HideResponseBridgeData, IHideRequestBridgeData, IHideRequestItem, IHideResponseItem, IServiceBridgeData, NotWordResponseBridgeData } from '../share/bridge/bridge-data';
import { BridgeMeesage } from '../share/bridge/bridge-meesage';
import { Exception, isNullOrEmpty, LoggingBase } from '../share/common';
import { BridgeMeesageKind } from '../share/define/bridge-meesage-kind';
import { MatchKind } from '../share/define/match-kind';
import { IService, ServiceKind } from '../share/define/service-kind';
import { QueryBase } from '../share/query/query-base';
import { IReadOnlyDeliveryHideSetting } from '../share/setting/delivery-hide-setting';
import { IReadOnlyDeliverySetting } from '../share/setting/delivery-setting';
import { IReadOnlyHideItemSetting } from '../share/setting/hide-item-setting';
import { IReadOnlyNotItemSetting } from '../share/setting/not-item-setting';
import { IReadOnlyServiceEnabledSetting } from '../share/setting/service-enabled-setting';
import { IReadOnlyServiceSetting } from '../share/setting/service-setting-base';
import { DeliveryHideItemConverter } from '../browser/delivery-hide-item';
import { HideCheckerBase } from './hide-checker/hide-checker-base';
import { HideItemStocker } from './hide-item-stocker';

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

    protected hideItemStocker: HideItemStocker;

    protected constructor(name: string, setting: TReadOnlyServiceSetting, settingItems: ISettingItems) {
        super(name);

        this.setting = setting;

        this.notItemWords = this.getEnabledNotItemWords(settingItems.notItems);

        this.hideItemStocker = new HideItemStocker();
        this.hideItemStocker.importHideItems(HideItemStocker.applicationKey, this.getEnabledHideItems(settingItems.hideItems));
    }

    protected abstract createHideChecker(): HideCheckerBase;

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

    public importDeliveryHideItems(deliveryHideItems: ReadonlyArray<IReadOnlyDeliveryHideSetting>, deliverySetting: IReadOnlyDeliverySetting): void {
        const converter = new DeliveryHideItemConverter();
        for(const deliveryHideItem of deliveryHideItems) {
            const deliveryHideLines = deliverySetting.hideItems[deliveryHideItem.url];
            if(!deliveryHideItems) {
                continue;
            }
            const hideItems = converter.convertItems(deliveryHideLines!, deliveryHideItem.service);
            const enabledHideItems = this.getEnabledHideItems(hideItems);
            this.hideItemStocker.importHideItems(deliveryHideItem.url, enabledHideItems);
        }
    }

    public receiveNotWordRequestMessage(port: browser.runtime.Port, message: BridgeMeesage<IServiceBridgeData>) {
        port.postMessage(
            new BridgeMeesage(
                BridgeMeesageKind.notWordResponse,
                new NotWordResponseBridgeData(
                    this.service,
                    this.setting.enabled,
                    this.notItemWords
                )
            )
        );
    }

    public receiveHideRequestMessage(port: browser.runtime.Port, message: BridgeMeesage<IHideRequestBridgeData>): any {
        if (!message.data.items.length) {
            this.logger.debug('hide element 0');
            return;
        }

        function createResponseItem(req: IHideRequestItem, isHide: boolean) {
            return {
                request: req,
                hideTarget: isHide,
            } as IHideResponseItem;
        }

        const hideChecker = this.createHideChecker();
        const responseStock = new Map<string, IHideResponseItem>();
        for(const [key, matchers] of this.hideItemStocker.hideMatchers) {
            this.logger.debug(`check group: ${key}`);
            let isBreak = false;
            for (const request of message.data.items) {
                // 既に隠し対象となったものはチェックしない
                if(responseStock.has(request.dataValue)) {
                    continue;
                }

                if(hideChecker.matchUrl(request.linkValue, matchers)) {
                    responseStock.set(request.dataValue, createResponseItem(request, true));
                }

                // 全部チェックされたのであればこれ以上何かする必要はない
                if(message.data.items.length <= responseStock.size) {
                    isBreak = true;
                    break;
                }
            }
            if(isBreak) {
                break;
            }
        }

        port.postMessage(
            new BridgeMeesage(
                BridgeMeesageKind.hideResponse,
                new HideResponseBridgeData(
                    this.service,
                    this.setting.enabled,
                    Array.from(responseStock.values())
                )
            )
        );
    }
}
