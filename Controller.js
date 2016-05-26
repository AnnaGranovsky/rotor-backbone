'use strict';
var _ = require('underscore'),
    fs = require('fs');

function Controller () {}

Controller.extend = function (protoProps, staticProps) {
    var parent = this,
        child;

    if (protoProps && _.has(protoProps, 'constructor')) {
        child = protoProps.constructor;
    } else {
        child = function () {
            return parent.apply(this, arguments);
        };
    }

    _.extend(child, parent, staticProps);

    var Surrogate = function () {
        this.constructor = child;
    };
    
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    if (protoProps) _.extend(child.prototype, protoProps);

    child.__super__ = parent.prototype;

    return child;
};  

_.extend(Controller.prototype, {
    methods: {
        'GET': 'getCollection',
        'POST': 'saveNew',
        'PUT': 'saveUpdated',
        'DELETE': 'deleteItem'
    },
    responseHead: {
        statusOK: '',
        statusErr: '',
        cookies: ''
    },
    response: '',
    method: '',
    collection: '',
    request: '',
    
    initialize: function (req, resp, action) {
        var reqBody;

        this.request = req;
        this.response = resp;
        reqBody = this.getRequestData(this.request);
        this.method = this.methods[this.request.method];

        if (this.request.method == 'POST' || this.request.method == 'PUT') {
            this.request.on('end', function() {
                reqBody = JSON.parse(Buffer.concat(reqBody));
                delete reqBody['id'];

                this.collection.initialize(function (result) {
                    this.collection[this.method](reqBody, action, this.sendResponse, this);
                    this.collection.on('destroy change', function (model) {
                        if (global.mediator) {
                            global.mediator.publish('Update socket', {collection: req.url});
                        }
                    });
                }, this);
            }.bind(this));
        } else {
            this.collection.initialize(function (result) {
                this.collection[this.method](action, this.sendResponse, this);
                this.collection.on('destroy change', function (model) {
                    if (global.mediator) {
                        global.mediator.publish('Update socket', {collection: req.url});
                    }
                });
            }, this);
        }
        
    },

    sendResponse: function (err, data) {
        if (err) {
            console.log(err);
            this.response.writeHead(this.responseHead.statusErr, {'Set-Cookie': this.responseHead.cookies});
            this.response.write(err);
            this.response.end();
        } else {
            this.response.writeHead(this.responseHead.statusOK, {'Content-Type': 'application/json', 'Set-Cookie': this.responseHead.cookies});
            this.response.write(JSON.stringify(this.formatData(data)));
            this.response.end();
        }
    },

    formatData: function (data) {
        var result = [];

        if (Array.isArray(data)) {
            data.forEach(function (item) {
                item.id = item._id;
                result.push(item);
            });
        } else {
            data.id = data._id;
            result = data;
        }

        return result;
    },

    getRequestData: function (request) {
        var body = [];
    
        request.on('data', function(chunk) {
            body.push(chunk);
        });

        return body;
    },

    parseCookies: function (request) {
        var rc = request.headers.cookie,
            list = {},
            parts;

        rc && rc.split(';').forEach(function (cookie) {
            parts = cookie.split('=');
            list[parts.shift().trim()] = decodeURI(parts.join('='));
        });

        return list;
    },

    sendFile: function (response, contentType, filePath) {
        fs.stat(filePath, function (err, stats) {
            if (stats) {
                fs.readFile(filePath, function(error, data) {
                    if (error) {
                        response.writeHead(500);
                        response.end();
                    } else {
                        response.writeHead(200, {'Content-Type': contentType});
                        response.write(data);
                        response.end();
                    }
                });
            } 
        });
    }
});

module.exports = Controller;