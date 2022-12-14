
export enum ElementId {
    optionsService = 'service',
    optionsServiceGoogle = 'service-is-enabled-google',
    optionsServiceGoogleSearchCount = 'service-google-search-count',
    optionsServiceGoogleSearchSafe = 'service-google-search-safe',
    optionsServiceBing = 'service-is-enabled-bing',

    optionsNotItemList = 'engine-not-word-list',
    optionsNotItemInputWord = 'engine-input-not-word',
    optionsNotItemInputServiceGoogle = 'engine-input-is-enabled-google',
    optionsNotItemInputServiceBing = 'engine-input-is-enabled-bing',
    optionsNotItemInputAdd = 'command-engine-add-not-item',

    optionsHideItemList = 'view-hide-host-list',
    optionsHideItemInputWord = 'view-input-hide-host',
    optionsHideItemInputMatchKind = 'view-input-hide-match-kind',
    optionsHideItemInputMatchCase = 'view-input-hide-match-case',
    optionsHideItemInputServiceGoogle = 'view-input-is-enabled-google',
    optionsHideItemInputServiceBing = 'view-input-is-enabled-bing',
    optionsHideItemInputAdd = 'command-view-add-hide-item',

    optionsDeliveryHideItemList = 'delivery-hide-item-list',
    optionsDeliveryHideItemRegisterInputUrl = 'delivery-hide-item-register-input-url',
    optionsDeliveryHideItemRegisterImport = 'command-delivery-hide-item-register-import',

    optionsWhitelistList = 'whitelist-list',
    optionsWhitelistInputWord = 'whitelist-input-word',
    optionsWhitelistInputMatchKind = 'whitelist-input-match-kind',
    optionsWhitelistInputMatchCase = 'whitelist-input-match-case',
    optionsWhitelistInputServiceGoogle = 'whitelist-input-is-enabled-google',
    optionsWhitelistInputServiceBing = 'whitelist-input-is-enabled-bing',
    optionsWhitelistInputAdd = 'command-add-whitelist',

    optionsInportExportExport = 'command-imp-exp-export',
    optionsInportExportCopy = 'command-imp-exp-copy',
    optionsInportExportExportArea = 'imp-exp-export-area',
    optionsInportExportImport = 'command-imp-exp-import',

    contentShowState = 'WE___search-hook-_-_-state'
}

export enum ElementClass {
    localeRoot = 'WE___search-hook-_-_-locale-root',
    hidden = 'WE___search-hook-_-_-hidden',
    hiddenItem = 'WE___search-hook-_-_-hidden-item',
    switch = 'WE___search-hook-_-_-switch',
}

export enum ElementName {
    optionsNotItemGroup = 'engine-not-item-group',
    optionsNotItemWord = 'engine-not-item-word',
    optionsNotItemServiceGoogle = 'engine-not-item-service-google',
    optionsNotItemServiceBing = 'engine-not-item-service-bing',
    optionsNotItemRemove = 'engine-not-item-remove',

    optionsHideItemGroup = 'view-hide-item-group',
    optionsHideItemWord = 'view-hide-item-host',
    optionsHideItemMatchKind = 'view-hide-item-match-kind',
    optionsHideItemMatchCase = 'view-hide-item-match-case',
    optionsHideItemServiceGoogle = 'view-hide-item-service-google',
    optionsHideItemServiceBing = 'view-hide-item-service-bing',
    optionsHideItemRemove = 'view-hide-item-remove',

    optionsDeliveryHideItemGroup = 'delivery-hide-item-group',
    optionsDeliveryHideItemUrl = 'delivery-hide-item-url',
    optionsDeliveryHideItemSetting = 'delivery-hide-item-setting',
    optionsDeliveryHideItemName = 'delivery-hide-item-name',
    optionsDeliveryHideItemVersion = 'delivery-hide-item-version',
    optionsDeliveryHideItemUpdate = 'delivery-hide-item-update',
    optionsDeliveryHideItemServiceGoogle = 'delivery-hide-item-service-google',
    optionsDeliveryHideItemServiceBing = 'delivery-hide-item-service-bing',
    optionsDeliveryHideItemRemove = 'delivery-hide-item-remove',

    optionsWhitelistGroup = 'whitelist-group',
    optionsWhitelistWord = 'whitelist-word',
    optionsWhitelistMatchKind = 'whitelist-match-kind',
    optionsWhitelistMatchCase = 'whitelist-match-case',
    optionsWhitelistServiceGoogle = 'whitelist-service-google',
    optionsWhitelistServiceBing = 'whitelist-service-bing',
    optionsWhitelistRemove = 'whitelist-remove',

}

export enum ElementData {
    locale = 'locale',
    /** ?????????????????????????????????????????????????????? */
    localeAttributes = 'localeAttributes',
    /** ?????????????????????????????????????????????????????????????????? */
    localeAttributeHead = 'localeAttribute',

    hideId = 'weSearchHookHideId',
}

export abstract class SelectorConverter {

    public static fromId(elementId: ElementId): string {
        return '#' + elementId;
    }

    public static fromClass(className: ElementClass): string {
        return '.' + className;
    }

    public static fromName(elementName: ElementName): string {
        return `[name="${elementName}"]`;
    }

    public static fromData(elementData: ElementData): string {
        const dataAttr = elementData.replace(/([A-Z])/g, m => {
            return '-' + m.toLowerCase();
        });
        return `[data-${dataAttr}]`;
    }

}


