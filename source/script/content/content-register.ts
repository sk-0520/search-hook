import { ContentBase } from "./content-base";
import { isNullOrEmpty } from "../share/common";
import { BridgeMeesage, BridgeMeesageBase } from "../share/bridge/bridge-meesage";
import { BridgeMeesageKind } from "../share/define/bridge-meesage-kind";
import { RegisterDeliveryHideRequestData, IRegisterDeliveryHideResponseData } from "../share/bridge/bridge-data";

export class ContentRegister extends ContentBase {

    private readonly linkHeader = 'we_sh://search-hook?';

    constructor() {
        super('ContentRegister');
    }

    public initialize(): void {
        this.connect();


        const elements = document.querySelectorAll(`a[href^="${this.linkHeader}"]`);
        
        for(const element of elements) {
            const linkElement = element as HTMLElement;
            if(linkElement) {
                const href = linkElement.getAttribute('href')!;
                const param = href.substr(this.linkHeader.length);
                if(isNullOrEmpty(param)) {
                    continue;
                }

                const params = new URLSearchParams(param);
                const kindValue = params.get('kind');
                const urlValue = params.get('url');

                // TODO: 将来的にチェックロジックなんとかしよう
                if(!kindValue || !urlValue || isNullOrEmpty(kindValue) || isNullOrEmpty(urlValue)) {
                    continue;
                }
                if(kindValue !== 'hide') {
                    continue;
                }

                linkElement.addEventListener('click', e => {
                    e.preventDefault();
                    
                    if(confirm('message')) {
                        this.registerHideItemAsync(urlValue);
                    }
                });
            }
        }
    }

    private registerHideItemAsync(urlValue: string): void {
        this.port!.postMessage(
            new BridgeMeesage(
                BridgeMeesageKind.registerDeliveryHideRequest,
                new RegisterDeliveryHideRequestData(urlValue)
            )
        );
    }

    protected receiveMessage(baseMessage: BridgeMeesageBase) {
        super.receiveMessage(baseMessage);

        switch(baseMessage.kind ) {
            case BridgeMeesageKind.registerDeliveryHideResponse:
                this.receiveRegisterDeliveryHideMessage(baseMessage as BridgeMeesage<IRegisterDeliveryHideResponseData>);
                break;
        }
    }

    private receiveRegisterDeliveryHideMessage(message: BridgeMeesage<IRegisterDeliveryHideResponseData>): void {
        if(message.data.success) {
            alert('success');
        } else {
            alert(message.data.message);
        }
    }

}
