'use strict';

var _ = require('underscore'),
	mongodb = require('mongodb'),
	assert = require('assert'),
    fs = require('fs'),
    ObjectId = mongodb.ObjectID;

var Store = function(name) {
	var MongoClient = mongodb.MongoClient;

	this.url = 'mongodb://localhost:27017/rotor';
	this.name = name;
	this.collection = '';

	this.getConnection = function (callback) {
        fs.stat('../db-config.json', function (err, stats) {
            if (stats) {
                fs.readFile('../db-config.json', 'utf8', function(error, data) {
                    if (error) {
                        console.log(error);
                    } else {
                        var config = JSON.parse(data);

                        MongoClient.connect('mongodb://' + config.host + ':' + config.port + '/' + config.DBname, function (err, db) {
                            if (err !== null) {
                                console.log('Unable to connect to the mongoDB server. Error:', err);
                            } else {
                                var collection = db.collection(this.name);

                                callback(collection, db);
                            }
                        }.bind(this));
                    }
                }.bind(this));
            } else {
                console.log("No db-config.json file found - using defaults");

                MongoClient.connect(this.url, function (err, db) {
                    if (err !== null) {
                        console.log('Unable to connect to the mongoDB server. Error:', err);
                    } else {
                        var collection = db.collection(this.name);

                        callback(collection, db);
                    }
                }.bind(this));
            }
        }.bind(this));
       	
    }
};

_.extend(Store.prototype, {

	save: function() {
        //
	},

	create: function(model, callback) {
        this.getConnection(function (collection, database) {
            collection.insert(model.toJSON(), function (err, result) {
                if (err !== null) {
                    console.log('Failed to insert document: ' + err);
                    callback(err, result);
                } else {
                    model.set({_id: result.ops[0]._id});
                    callback(err, result.ops[0]);
                }
                
                database.close();
            });
        });
	},

	update: function(model, callback) {
		this.getConnection(function (collection, database) {
            var data = model.toJSON();

            delete data._id;

            collection.findOneAndUpdate(
                {"_id": ObjectId(model.id)},
                {$set: data},
                {returnNewDocument: true, upsert: false},
                function (err, result) {
                    if (err !== null) {
                        console.log('Failed to update document: ' + err);
                        callback(err, data);
                    } else {
                        callback(err, data);
                    }

                database.close();
            });
        });
	},

	find: function(model, callback) {
		this.getConnection(function (collection, database) {
            collection.find({"_id": ObjectId(model.id)}, function (err, result) {
                if (err !== null) {
                    console.log('Failed to find document: ' + err);
                    callback(err, result);
                } else {
                    callback(err, result);
                }

                database.close();
            });
        });
	},

	findAll: function(callback) {
		this.getConnection(function (collection, database) {
            collection.find({}).toArray(function(err, result) {
                if (err !== null) {
                    console.log('Failed to find documents: ' + err);
                    callback(err, result);
                } else {
                    callback(err, result);
                }

                database.close();
            });
        });
	},

	destroy: function(model, callback) {
		this.getConnection(function (collection, database) {
            collection.findOneAndDelete({"_id": ObjectId(model.id)}, function (err, result) {
                if (err !== null) {
                    console.log('Failed to delete document: ' + err);
                    callback(err, result);
                } else {
                    callback(err, result);
                }

                database.close();
            }, true);
        });
	}

});

module.exports = Store;