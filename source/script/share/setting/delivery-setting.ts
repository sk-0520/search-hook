
export interface IReadOnlyDeliverySetting {
    readonly hideItems: { [key: string]: ReadonlyArray<string> };
}

export interface IDeliverySetting extends IReadOnlyDeliverySetting {
    hideItems: { [key: string]: Array<string> };
}

export class DeliverySetting implements IDeliverySetting {
    public hideItems: { [key: string]: Array<string> } = { };
}

