
export enum ElementClass {
    hidden = 'WE___search-hook-_-_-hidden',
    hiddenItem = 'WE___search-hook-_-_-hidden-item',
    switch = 'WE___search-hook-_-_-switch',
}

export function toSelector(ec: ElementClass): string {
    return '.' + ec;
}
