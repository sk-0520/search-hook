import { HideResponseBridgeData, IHideRequestBridgeData, IHideRequestItem, IHideResponseItem, IServiceBridgeData, NotWordResponseBridgeData } from '../share/bridge/bridge-data';
import { BridgeMeesage } from '../share/bridge/bridge-meesage';
import { checkService, isNullOrEmpty, LoggingBase } from '../share/common';
import { BridgeMeesageKind } from '../share/define/bridge-meesage-kind';
import { IService, ServiceKind } from '../share/define/service-kind';
import { QueryBase } from '../share/query/query-base';
import { IReadOnlyNotItemSetting } from '../share/setting/not-item-setting';
import { IReadOnlyServiceSetting } from '../share/setting/service-setting-base';
import { HideItemStocker } from './hide-item-stocker';
import { WordMatcherBase } from './word-matcher/word-matcher-base';

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
}

export abstract class BackgroundServiceBase<TReadOnlyServiceSetting extends IReadOnlyServiceSetting> extends LoggingBase implements IService {
    public abstract readonly service: ServiceKind;
    protected abstract readonly filter: browser.webRequest.RequestFilter;
    //abstract readonly extraInfoSpec?: Array<U>;

    private requestSet = new Set();
    protected setting: TReadOnlyServiceSetting;

    protected notItemWords: ReadonlyArray<string>;

    protected hideItemStocker: HideItemStocker;

    protected constructor(name: string, setting: TReadOnlyServiceSetting, settingItems: ISettingItems, hideItemStocker: HideItemStocker) {
        super(name);

        this.setting = setting;

        this.notItemWords = this.getEnabledNotItemWords(settingItems.notItems);

        this.hideItemStocker = hideItemStocker;
        this.logger.dumpDebug(this.hideItemStocker);
    }

    protected abstract createWordMatcher(): WordMatcherBase;

    protected getEnabledNotItemWords(notItems: ReadonlyArray<IReadOnlyNotItemSetting>): Array<string> {
        return notItems.filter(i => {
            return checkService(this.service, i.service);
        }).filter(i => {
            return !isNullOrEmpty(i.word);
        }).map(i => {
            return i.word;
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

    private removeWhitelistHitItems(responseStock: ReadonlyMap<string, IHideResponseItem>): Array<IHideResponseItem> {
        const wordMatcher = this.createWordMatcher();

        return Array.from(responseStock.values()).filter(i => {
            return !wordMatcher.matchUrl(i.request.linkValue, this.hideItemStocker.whitelistMatchers);
        });
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

        const wordMatcher = this.createWordMatcher();
        const responseStock = new Map<string, IHideResponseItem>();
        for (const [key, matchers] of this.hideItemStocker.hideMatchers) {

            this.logger.debug(`check group: ${key}`);
            let isBreak = false;
            for (const request of message.data.items) {
                // 既に隠し対象となったものはチェックしない
                if (responseStock.has(request.dataValue)) {
                    continue;
                }

                if (wordMatcher.matchUrl(request.linkValue, matchers)) {
                    responseStock.set(request.dataValue, createResponseItem(request, true));
                }

                // 全部チェックされたのであればこれ以上何かする必要はない
                if (message.data.items.length <= responseStock.size) {
                    isBreak = true;
                    break;
                }
            }
            if (isBreak) {
                break;
            }
        }

        // ホワイトリストに該当するものを除外
        const filterdItems = this.removeWhitelistHitItems(responseStock);

        port.postMessage(
            new BridgeMeesage(
                BridgeMeesageKind.hideResponse,
                new HideResponseBridgeData(
                    this.service,
                    this.setting.enabled,
                    filterdItems
                )
            )
        );
    }
}
