import * as shared from './shared';
import * as setting from './setting';

export class Options extends shared.ActionBase {
    constructor() {
        super('Options');
    }

    public initialize() {
        document.addEventListener('DOMContentLoaded', this.restore);
        document.querySelector('form')!.addEventListener('submit', this.save);
        
        document.querySelector('#command-engine-add-not-item')!.addEventListener('click', this.addNotItemFromInput);
        document.querySelector('#command-view-add-hide-item')!.addEventListener('click', this.addHideItemFromInput);
    }

    private restore(): void {
    }
    private save(): void {
    }

    private addNotItemFromInput():void {}
    private addHideItemFromInput():void {}
}
