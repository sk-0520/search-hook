import { LoggingBase } from "../common";
import { ServiceKind, IService } from "../define/service-kind";

export default abstract class QueryBase extends LoggingBase implements IService {

    public abstract readonly service: ServiceKind;

    protected constructor(name: string) {
        super(name);
    }

    public splitQuery(query: string) {
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

    public makeCustomQuery(queryItems: ReadonlyArray<string>, notItems: ReadonlyArray<string>) {
        // 既に存在する否定ワードはそのまま、設定されていなければ追加していく

        const addNotItems = notItems.concat();
        const customQuery = [];
        for (const query of queryItems) {

            if (!query.length) {
                continue;
            }

            //<JS>if(query.charAt('-')) {
            if (query.charAt(0) === '-') {
                const notWord = query.substr(1);
                const index = addNotItems.indexOf(notWord);
                customQuery.push(query);
                if (index !== -1) {
                    addNotItems.splice(index, 1);
                }
            } else {
                customQuery.push(query);
            }
        }

        this.logger.debug('notItems: ' + notItems);
        this.logger.debug('addNotItems: ' + addNotItems);

        for (let j = 0; j < addNotItems.length; j++) {
            const word = addNotItems[j];
            addNotItems[j] = '-' + word;
        }

        return {
            users: customQuery,
            applications: addNotItems
        };
    }

    public getUserInputQuery(queryItems: ReadonlyArray<string>, notItems: ReadonlyArray<string>) {
        // 否定ワードを除外
        const addNotItems = notItems.concat();
        const userQuerys = [];
        for (const query of queryItems) {

            if (!query.length) {
                continue;
            }

            //<JS>if(query.charAt('-')) {
            if (query.charAt(0) === '-') {
                const notWord = query.substr(1);
                const index = addNotItems.indexOf(notWord);
                if (index !== -1) {
                    addNotItems.splice(index, 1);
                } else {
                    userQuerys.push(query);
                }
            } else {
                userQuerys.push(query);
            }
        }

        return userQuerys;
    }

    public toQueryString(queryItems: Array<string>) {
        const items = queryItems.filter(s => {
            return s && s.length;
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
