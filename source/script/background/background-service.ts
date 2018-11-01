import { LoggingBase, isNullOrEmpty, Exception } from '../share/common';
import { IService, ServiceKind } from '../share/define/service-kind';
import { IReadOnlyNotItemSetting } from '../share/setting/not-item-setting';
import { IReadOnlyServiceSetting } from '../share/setting/service-setting-base';
import { QueryBase } from '../share/query/query';
import { IReadOnlyHideItemSetting, IHideItemSetting } from '../share/setting/hide-item-setting';
import { MatchKind } from '../share/define/match-kind';
import { BridgeMeesage } from '../share/bridge/bridge-meesage';
import { NotWordResponseBridgeData, IHideRequestBridgeData, IHideResponseItem, IHideRequestItem, HideResponseBridgeData, IBridgeData } from '../share/bridge/bridge-data';
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

interface IHideCheker {
    item: IHideItemSetting;
    match: (s: string) => boolean;
}

export abstract class BackgroundServiceBase<TReadOnlyServiceSetting extends IReadOnlyServiceSetting> extends LoggingBase implements IService {

    public abstract readonly service: ServiceKind;
    protected abstract readonly filter: browser.webRequest.RequestFilter;
    //abstract readonly extraInfoSpec?: Array<U>;

    private requestSet = new Set();
    protected setting: TReadOnlyServiceSetting;

    protected notItemWords: ReadonlyArray<string>;
    protected hideItems: ReadonlyArray<IReadOnlyHideItemSetting>;
    protected hideChecker: ReadonlyArray<IHideCheker>;

    protected constructor(name: string, setting: TReadOnlyServiceSetting, settingItems: ISettingItems) {
        super(name);

        this.setting = setting;

        this.notItemWords = this.getEnabledNotItemWords(settingItems.notItems);
        this.hideItems = this.getEnabledHideItems(settingItems.hideItems);
        this.hideChecker = this.getCheckers(this.hideItems);
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

    protected getCheckers(hideItems: ReadonlyArray<IReadOnlyHideItemSetting>): Array<IHideCheker> {
        return hideItems.map(i => {
            let func: (s: string) => boolean;

            switch (i.match.kind) {
                case MatchKind.partial:
                    if (i.match.case) {
                        const word = i.word.toUpperCase();
                        func = s => {
                            return s.toUpperCase().indexOf(word) !== -1;
                        };
                    } else {
                        func = s => {
                            return s.indexOf(i.word) !== -1;
                        };
                    }
                    break;

                case MatchKind.forward:
                    if (i.match.case) {
                        const word = i.word.toUpperCase();
                        func = s => {
                            return s.toUpperCase().indexOf(word) === 0;
                        };
                    } else {
                        func = s => {
                            return s.indexOf(i.word) === 0;
                        };
                    }
                    break;

                case MatchKind.perfect:
                    if (i.match.case) {
                        const word = i.word.toUpperCase();
                        func = s => {
                            return s.toUpperCase() === word;
                        };
                    } else {
                        func = s => {
                            return s === i.word;
                        };
                    }
                    break;

                case MatchKind.regex:
                    const reg = i.match.case ? new RegExp(i.word) : new RegExp(i.word, 'i');
                    func = s => {
                        return reg.test(s);
                    };
                    break;

                default:
                    throw { error: i };
            }

            return {
                item: i,
                match: func,
            } as IHideCheker;
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

    public receiveNotWordRequestMessage(port: browser.runtime.Port, message: BridgeMeesage<IBridgeData>) {
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


    private matchUrl(linkValue: string, checkers: ReadonlyArray<IHideCheker>): boolean {

        let url: URL;
        try {
            url = new URL(linkValue);
        } catch (ex) {
            this.logger.error(ex);
            return false;
        }

        // プロトコル、ポート、パスワード云々は無視
        let urlValue = url.hostname;
        if (url.pathname && url.pathname.length) {
            urlValue += url.pathname;
        }
        if (url.search && url.search.length) {
            urlValue += url.search;
        }

        return checkers.some(i => i.match(urlValue));
    }

    protected matchSimpleUrl(linkValue: string, checkers: ReadonlyArray<IHideCheker>): boolean {
        return this.matchUrl(linkValue, checkers);
    }

    protected matchQueryUrl(linkValue: string, checkers: ReadonlyArray<IHideCheker>): boolean {
        try {
            const index = linkValue.indexOf('?');
            if (index !== -1) {
                const params = new URLSearchParams(linkValue.substr(index + 1));
                this.logger.debug('params: ' + params);

                if (params.has('q')) {
                    const query = params.get('q')!;
                    this.logger.debug('q: ' + query);

                    return this.matchUrl(query, checkers);
                }
            }
        } catch (ex) {
            this.logger.error(ex);
        }

        return false;
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

        const responseItems = new Array<IHideResponseItem>();
        for (const request of message.data.items) {
            // 普通パターン
            if (this.matchSimpleUrl(request.linkValue, this.hideChecker)) {
                responseItems.push(createResponseItem(request, true));
                continue;
            }

            // /path?q=XXX 形式
            if (this.matchQueryUrl(request.linkValue, this.hideChecker)) {
                responseItems.push(createResponseItem(request, true));
                continue;
            }

            responseItems.push(createResponseItem(request, false));
        }

        port.postMessage(
            new BridgeMeesage(
                BridgeMeesageKind.hideResponse,
                new HideResponseBridgeData(
                    this.service,
                    this.setting.enabled,
                    responseItems
                )
            )
        );
    }
}
