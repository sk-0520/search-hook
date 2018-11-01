
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
    optionsHideItemInputWord  = 'view-input-hide-host',
    optionsHideItemInputMatchKind  = 'view-input-hide-match-kind',
    optionsHideItemInputMatchCase  = 'view-input-hide-match-case',
    optionsHideItemInputServiceGoogle  = 'view-input-is-enabled-google',
    optionsHideItemInputServiceBing  = 'view-input-is-enabled-bing',
    optionsHideItemInputAdd  = 'command-view-add-hide-item',

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
}

export enum ElementData {
    locale = 'locale',
    /** ロケールを属性に設定する旨を印付ける */
    localeAttributes = 'localeAttributes',
    /** ロケールを属性に設定する場合の属性名の識別子 */
    localeAttributeHead = 'localeAttribute',

    hideId = 'hideId',
}

export function toIdSelector(elementId: ElementId): string {
    return '#' + elementId;
}
export function toClassSelector(className: ElementClass): string {
    return '.' + className;
}
export function toNameSelector(elementName: ElementName): string {
    return `[name="${elementName}"]`;
}
export function toDataSelector(elementData: ElementData): string {
    return `[data-${elementData}]`;
}

