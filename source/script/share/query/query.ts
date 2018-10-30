import { LoggingBase, isNullOrEmpty } from "../common";
import { ServiceKind, IService } from "../define/service-kind";

export interface IUserAndApplicationQuery {
    /** ユーザー入力 */
    users: Array<string>;
    /** アプリケーション入力 */
    applications: Array<string>;
}

export abstract class QueryBase extends LoggingBase implements IService {

    public abstract readonly service: ServiceKind;

    protected constructor(name: string) {
        super(name);
    }

    /**
     * クエリ文字列を分割
     * @param query 
     */
    public split(query: string) {
        if (!query) {
            return [];
        }

        let nowDq = false;

        let buffer = '';
        const result = [];

        for (let i = 0; i < query.length; i++) {
            const c = query.charAt(i);
            if (nowDq) {
                if (c === '"') {
                    if (buffer.length) {
                        result.push(buffer);
                        buffer = '';
                        nowDq = false;
                    }
                } else {
                    buffer += c;
                }
            } else if (c === ' ') {
                if (buffer.length) {
                    result.push(buffer);
                    buffer = '';
                }
            } else if (c === '"') {
                nowDq = true;
            } else {
                buffer += c;
            }
        }

        if (buffer.length) {
            result.push(buffer);
        }

        return result;
    }

    /** 既に存在する否定ワードはそのまま、設定されていなければ追加していく */
    public addNotItemWords(queryWords: ReadonlyArray<string>, notItemWords: ReadonlyArray<string>): IUserAndApplicationQuery {
        const addNotWords = notItemWords.concat();
        const userInputWords: Array<string> = [];
        for (const word of queryWords) {

            if (!word.length) {
                continue;
            }

            if (word.charAt(0) === '-') {
                const notWord = word.substr(1);
                const index = addNotWords.indexOf(notWord);
                userInputWords.push(word);
                if (index !== -1) {
                    addNotWords.splice(index, 1);
                }
            } else {
                userInputWords.push(word);
            }
        }

        for (let i = 0; i < addNotWords.length; i++) {
            const word = addNotWords[i];
            addNotWords[i] = '-' + word;
        }

        return {
            users: userInputWords,
            applications: addNotWords
        } as IUserAndApplicationQuery;
    }

    /** 設定否定文言を除外 */
    public getUserInput(queryWords: ReadonlyArray<string>, notItemWords: ReadonlyArray<string>) {
        const addNotWords = notItemWords.concat();
        const userInputWords: Array<string> = [];
        for (const word of queryWords) {

            if (!word.length) {
                continue;
            }

            if (word.charAt(0) === '-') {
                const notWord = word.substr(1);
                const index = addNotWords.indexOf(notWord);
                if (index !== -1) {
                    addNotWords.splice(index, 1);
                } else {
                    userInputWords.push(word);
                }
            } else {
                userInputWords.push(word);
            }
        }

        return userInputWords;
    }

    /** クエリ文字列の構築 */
    public toString(queryItems: ReadonlyArray<string>) {
        const items = queryItems.filter(s => {
            return !isNullOrEmpty(s);
        }).map(s => {
            if (s.indexOf(' ') !== -1) {
                if (s.charAt(0) === '-') {
                    return '-"' + s.substr(1) + '"';
                }

                return '"' + s + '"';
            } else {
                return s;
            }
        });

        return items.join(' ');
    }
}
