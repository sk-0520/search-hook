import { LoggingBase, isNullOrEmpty, Exception } from '../share/common';
import { IService, ServiceKind } from '../share/define/service-kind';
import { IReadOnlyNotItemSetting } from '../share/setting/not-item-setting';
import { IReadOnlyServiceSetting } from '../share/setting/service-setting-base';
import QueryBase from '../share/query/query';

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

export abstract class BackgroundServiceBase<TReadOnlyServiceSetting extends IReadOnlyServiceSetting> extends LoggingBase implements IService {

    public abstract readonly service: ServiceKind;
    protected abstract readonly filter: browser.webRequest.RequestFilter;
    //abstract readonly extraInfoSpec?: Array<U>;

    private requestSet = new Set();
    protected setting: TReadOnlyServiceSetting;

    protected constructor(name: string, setting: TReadOnlyServiceSetting) {
        super(name);

        this.setting = setting;
    }

    protected abstract redirect(requestDetails: IRequestDetails, url: URL, notItemWords: ReadonlyArray<string>): browser.webRequest.BlockingResponse | undefined;

    protected getEnabledNotItemWords(notItems: ReadonlyArray<IReadOnlyNotItemSetting>): Array<string> {
        return notItems.filter(i => {
            switch (this.service) {
                case ServiceKind.google:
                    return i.service.google;

                case ServiceKind.bing:
                    return i.service.bing;

                default:
                    throw new Exception(i);
            }
        }).filter(i => {
            return !isNullOrEmpty(i.word);
        }).map(i => {
            return i.word;
        });

    }

    public registerRedirect(notItems: ReadonlyArray<IReadOnlyNotItemSetting>): void {

        const notItemWords = this.getEnabledNotItemWords(notItems);

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

                return this.redirect(requestDetails, url, notItemWords);
            },
            this.filter,
            ['blocking'] // このアプリケーションはこれしか使わん
        );

    }

    protected tuneSearchWord(word: string, query:QueryBase, notItemWords:ReadonlyArray<string>): string {
        this.logger.debug('raw: ' + word);
        const queryItems = query.splitQuery(word);
        this.logger.debug('items: ' + queryItems);

        const customQuery = query.makeCustomQuery(queryItems, notItemWords);
        this.logger.debug('customQuery: ' + JSON.stringify(customQuery));

        const queryString = query.toQueryString(customQuery.users.concat(customQuery.applications));
        this.logger.debug('queryString: ' + queryString);

        return queryString;
    }


}
