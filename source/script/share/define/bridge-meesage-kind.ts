export enum BridgeMeesageKind {
    /** 検索除外ワード要求 */
    notWordRequest = 'not-word-req',
    /** 検索除外ワード応答 */
    notWordResponse = 'not-word-res',

    /** 非表示項目要求 */
    hideRequest = 'hide-req',
    /** 非表示項目返答 */
    hideResponse = 'hide-res',

    /** ログ出力 */
    outputLog = 'log',

    /** 外部非表示設定登録要求 */
    registerDeliveryHideRequest = 'delivery-hide-req',
    registerDeliveryHideResponse = 'delivery-hide-res',
}
