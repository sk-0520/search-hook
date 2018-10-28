
export enum ServiceKind {
    google = 'google',
    bing = 'bing',
}

export interface IService {
    readonly service: ServiceKind;
}
