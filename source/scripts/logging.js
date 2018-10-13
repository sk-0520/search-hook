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
