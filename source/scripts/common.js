'use strict'

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

function splitQuery(s) {
    if(!s) {
        return [];
    }

    var nowDq = false;

    var buffer = '';
    var result = [];

    for(var i = 0; i < s.length; i++) {
        var c = s.charAt(i);
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
