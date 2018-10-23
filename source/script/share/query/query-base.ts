import { ServiceKind, LoggingBase } from "../common";


export default abstract class QueryBase extends LoggingBase {

    constructor(service: ServiceKind, name: string) {
        super(name);

        this.service = service;
    }

    public readonly service: ServiceKind;

    public splitQuery(query: string) {
        if (!query) {
            return [];
        }

        var nowDq = false;

        var buffer = '';
        var result = [];

        for (var i = 0; i < query.length; i++) {
            var c = query.charAt(i);
            if (nowDq) {
                if (c == '"') {
                    if (buffer.length) {
                        result.push(buffer);
                        buffer = '';
                        nowDq = false;
                    }
                } else {
                    buffer += c;
                }
            } else if (c == ' ') {
                if (buffer.length) {
                    result.push(buffer);
                    buffer = '';
                }
            } else if (c == '"') {
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

    public makeCustomQuery(queryItems: Array<string>, notItems: Array<string>) {
        // 既に存在する否定ワードはそのまま、設定されていなければ追加していく

        var addNotItems = notItems.concat();
        var customQuery = [];
        for (var i = 0; i < queryItems.length; i++) {
            var query = queryItems[i];

            if (!query.length) {
                continue;
            }

            //<JS>if(query.charAt('-')) {
            if (query.charAt(0) == '-') {
                var notWord = query.substr(1);
                var index = addNotItems.indexOf(notWord);
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

        for (var i = 0; i < addNotItems.length; i++) {
            var word = addNotItems[i];
            addNotItems[i] = '-' + word;
        }

        return {
            users: customQuery,
            applications: addNotItems
        };
    }

    public getUserInputQuery(queryItems: Array<string>, notItems: Array<string>) {
        // 否定ワードを除外
        var addNotItems = notItems.concat();
        var userQuerys = [];
        for (var i = 0; i < queryItems.length; i++) {
            var query = queryItems[i];

            if (!query.length) {
                continue;
            }

            //<JS>if(query.charAt('-')) {
            if (query.charAt(0) == '-') {
                var notWord = query.substr(1);
                var index = addNotItems.indexOf(notWord);
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
        var items = queryItems.filter(function (s) {
            return s && s.length;
        }).map(function (s) {
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
