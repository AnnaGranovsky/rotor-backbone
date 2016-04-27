'use strict';

var Rotor = require('backbone'),
	Store = require('./Store');

var Controller = Rotor.Controller = require('./Controller');

var Model = Rotor.Model = Rotor.Model.extend({
	idAttribute: '_id',
	name: ''
});

var Collection = Rotor.Collection = Rotor.Collection.extend({
    name: '',

    initialize: function (callback, context) {
        this.fetch({success: function (result) {
			if (callback) {
				callback.call(context, result);
				context = null;
			}
		}},{wait: true});
    },

    getCollection: function (action, callback, context) {
    	if (callback) {
    		callback.call(context, '', this.toJSON());
    		context = null;
    	}
    	
    	return this.toJSON();
    },

    deleteItem: function (action, callback, context) {
    	var model = this.get(action);

    	if (model) {
    		model.destroy({success: function (result) {
	    		callback.call(context, '', result);
	    		context = null;
	    	}, error: function (err) {
	    		callback.call(context, err);
	    		context = null;
	    	}}, {wait: true});
    	} else {
    		callback.call(context, 'No such model');
	    	context = null;
    	}
    },

    saveNew: function (data, action, callback, context) {
    	this.create(data, {success: function (result) {
    		callback.call(context, '', result.attributes);
    		context = null;
    	}, error: function (err) {
    		callback.call(context, err);
    		context = null;
    	}}, {wait: true});
    },

    saveUpdated: function (data, action, callback, context) {
    	var model = this.get(action);

    	if (model) {
    		model.save(data, {success: function (result) {
	    		callback.call(context, '', result.attributes);
	    		context = null;
	    	}, error: function (err) {
	    		callback.call(context, err);
	    		context = null;
	    	}}, {wait: true});
    	} else {
    		callback.call(context, 'No such model');
	    	context = null;
    	}
    }
});

Rotor.sync = function(method, model, options) {
		var resp;
		var store = new Store(model.name || model.collection.name);

		switch (method) {
			case "read":    
				resp = model.id ? store.find(model, function (err, result) {
					if (err !== null) {
						options.error(err);
					} else {
						options.success(result);
					}
				}) : store.findAll(function (err, result) {
					if (err !== null) {
						options.error(err);
					} else {
						options.success(result);
					}
				}); 
				break;

			case "create":  resp = store.create(model, function (err, result) {
				if (err !== null) {
					options.error(err);
				} else {
					options.success(result);
				}
			});                            
				break;

			case "update":  resp = store.update(model, function (err, result) {
				if (err !== null) {
					options.error(err);
				} else {
					options.success(result);
				}
			});                            
				break;

			case "delete":  resp = store.destroy(model, function (err, result) {
				if (err !== null) {
					options.error(err);
				} else {
					options.success(result);
				}
			});                           
				break;
				
			default: options.error("Record not found");
		}
};

module.exports = Rotor;
