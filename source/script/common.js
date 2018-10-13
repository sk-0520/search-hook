'use strict'

const ServiceKind_Google = 'google';
const ServiceKind_Bing = 'bing';

function createLogger(name) {
    return {
        log: function(msg) {
            console.log(`<OP-S> [${name}] ${msg}`);
        },
        debug: function(msg) {
            console.debug(`<OP-S> [${name}] ${msg}`);
        },
        error: function(msg) {
            console.error(`<OP-S> [${name}] ${msg}`);
        }
    }
};

function merge(src, overwite) {
    if(!src) {
        return src;
    }
    if(!overwite) {
        return src;
    }
    //
    for (var key in overwite) {
        try {
            if(overwite[key].constructor == Object ) {
                src[key] = merge(src[key], overwite[key]);
            } else {
                src[key] = overwite[key];
            }
        } catch(e) {
            src[key] = overwite[key];
        }
    }

    return src;
}

function createBaseSetting() {
    var baseSetting = {
        service: {
            google: {
                enabled: false,
                searchCount: 10,
                searchSafe: true,
                searchFilter: true
            },
            bing: {
                enabled: false
                //searchCount: 10
            }
        },
        notItems: [],
        hideItems: []
    };

    return baseSetting;
}

function splitQuery(service, query) {
    if(!query) {
        return [];
    }

    var nowDq = false;

    var buffer = '';
    var result = [];

    for(var i = 0; i < query.length; i++) {
        var c = query.charAt(i);
        if(nowDq) {
            if(c == '"') {
                if(buffer.length) {
                    result.push(buffer);
                    buffer = '';
                    nowDq = false;
                }
            } else {
                buffer += c;
            }
        } else if(c == ' ') {
            if(buffer.length) {
                result.push(buffer);
                buffer = '';
            }
        } else if(c == '"') {
            nowDq = true;
        } else {
            buffer += c;
        }
    }

    if(buffer.length) {
        result.push(buffer);
    }

    return result;
}

function makeCustomQuery(service, queryItems, notItems) {
    // 既に存在する否定ワードはそのまま、設定されていなければ追加していく

    var addNotItems = notItems.concat();
    var customQuery = [];
    for(var i = 0; i < queryItems.length; i++) {
        var query = queryItems[i];

        if(!query.length) {
            continue;
        }

        if(query.charAt('-')) {
            var notWord = query.substr(1);
            var index = addNotItems.indexOf(notWord);
            customQuery.push(query);
            if(index !== -1) {
                addNotItems.splice(index, 1);
            }
        } else {
            customQuery.push(query);
        }
    }

    outputGoogle.debug('notItems: ' + notItems);
    outputGoogle.debug('addNotItems: ' + addNotItems);

    for(var i = 0; i < addNotItems.length; i++) {
        var word = addNotItems[i];
        customQuery.push('-' + word);
    }

    outputGoogle.debug('customQuery: ' + customQuery);

    return customQuery;
}

function toQueryString(service, queryItems) {
    var items = queryItems.filter(function(s) {
        return s && s.length;
    }).map(function(s) {
        if(s.indexOf(' ') !== -1) {
            if(s.charAt(0) === '-') {
                return '-"' + s.substr(1) + '"';
            }

            return '"' + s + '"';
        } else {
            return s;
        }
    });

    return items.join(' ');
}
