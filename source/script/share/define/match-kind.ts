
export enum MatchKind {
    partial = 'partial',
    forward = 'forward',
    perfect = 'perfect',
    regex = 'regex',
}

export function convertMatchKind(key: string): MatchKind {
    switch (key.toLowerCase()) {
        case MatchKind.partial:
            return MatchKind.partial;

        case MatchKind.perfect:
            return MatchKind.perfect;

        case MatchKind.regex:
            return MatchKind.regex;

        default:
            throw { error: key };
    }
}

