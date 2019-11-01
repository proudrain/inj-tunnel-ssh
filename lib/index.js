var net = require('net');
// var { isLegalPort, normalizedArgsSymbol } = require('internal/net');
var events = require('events');
var Promise = require('bluebird');
var tunnel = Promise.promisify(require('tunnel-ssh'));
var localPort = Promise.promisify(require('./port'));
var find = require('lodash.find');
// Save a copy from the original
var connect = net.Socket.prototype.connect;
var debug;

try {
    debug = require('debug')('tunnel.net');
} catch (e) {
    debug = function() {
        // noop
    };
}
// Borrowed from node source (net.js)
function isPipeName(s) {
    return typeof s === 'string' && toNumber(s) === false;
}

// Borrowed from node source (net.js)
function toNumber(x) {
    return (x = Number(x)) >= 0 ? x : false;
}

// Borrowed from node source  without `normalizedArgsSymbol` symbol setting (net.js)
// Returns an array [options] or [options, cb]
function normalizeArgs(args) {
    var arr;

    if (args.length === 0) {
        arr = [{}, null];
        arr[normalizedArgsSymbol] = true;
        return arr;
    }

    var arg0 = args[0];
    var options = {};
    if (typeof arg0 === 'object' && arg0 !== null) {
        // (options[...][, cb])
        options = arg0;
    } else if (isPipeName(arg0)) {
        // (path[...][, cb])
        options.path = arg0;
    } else {
        // ([port][, host][...][, cb])
        options.port = arg0;
        if (args.length > 1 && typeof args[1] === 'string') {
        options.host = args[1];
        }
    }

    var cb = args[args.length - 1];
    if (typeof cb !== 'function')
        arr = [options, null];
    else
        arr = [options, cb];

    return arr;
}

function hasValidConfiguration(options) {
    return options !== null || typeof options === 'object';
}

module.exports = function(configCollection) {
    var emitter = new events.EventEmitter();

    /**
     * Socket connect prototype to use ssh connection
     * Check if config for target is set
     * Start SSH tunnel if not already started
     *
     * @param options
     * @param cb
     * @returns {net.Socket}
     */
    var con = net.Socket.prototype.connect = function() {
        var self = this;
        var args = arguments;

        // Borrowed from net.js without `normalizedArgsSymbol` symbol check (net.js)
        var normalized;
        if (Array.isArray(args[0])) {
            normalized = args[0];
        } else {
            normalized = normalizeArgs(args);
        }
        var options = normalized[0];
        var cb = normalized[1];

        var configElement = find(configCollection, {dstHost: options.host, dstPort: options.port});

        // Exit if no config was found.
        if (!configElement) {
            debug('skip, %j', options);
            return connect.apply(self, args);
        }

        if (!configElement.promise) {
            configElement.promise = localPort(configElement.localPort || 3000).then(function(port) {
                configElement.localPort = port;
                return tunnel(configElement).then(function(tnl) {
                    tnl.on('close', function() {
                        debug('remove tunnel');
                        delete configElement.promise;
                    });
                });
            }).catch(function(e) {
                emitter.emit(e);
            });
        }
        configElement.promise.then(function() {
            options.host = configElement.localHost;
            options.port = configElement.localPort;
            debug('connect %j', options)
            connect.call(self, options, cb);
        });
        return self;
    };

    return emitter;
};
