import { LoggingBase } from '../share/common';
import { IService, ServiceKind } from '../share/define/service-kind';

export default abstract class BackgroundServiceBase extends LoggingBase implements IService {

    public abstract readonly service: ServiceKind;

    constructor(name: string) {
        super(name);
    }
}
