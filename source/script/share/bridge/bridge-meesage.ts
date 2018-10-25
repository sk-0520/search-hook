import { BridgeMeesageKind } from "../define/bridge-meesage-kind";
import { IBridgeData } from "./bridge-data";

export abstract class BridgeMeesageBase {
    public readonly kind: BridgeMeesageKind;

    constructor(kind: BridgeMeesageKind) {
        this.kind = kind;
    }
}

export class BridgeMeesage<TData extends IBridgeData> extends BridgeMeesageBase {
    public readonly data: TData;

    constructor(kind: BridgeMeesageKind, data: TData) {
        super(kind);
        this.data = data;
    }
}
