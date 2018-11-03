
export interface IReadOnlyDeliverySetting {
    readonly hideItems: ReadonlyMap<string, ReadonlyArray<string>>;
}

export interface IDeliverySetting extends IReadOnlyDeliverySetting {
    hideItems: Map<string, Array<string>>;
}

export class DeliverySetting implements IDeliverySetting {
    public hideItems = new Map<string, Array<string>>();
}

