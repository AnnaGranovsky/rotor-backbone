Library for node.js server Backbone

## Usage

Controllers
```js
var Rotor = require('rotor-backbone');

var Controller = Rotor.Controller.extend({
	collection: require('./Models/Collection'),
});

module.exports = new Controller();
```

## Collections
```js
var Rotor = require('rotor-backbone'),
	Model = require('./Model');

var Collection = Rotor.Collection.extend({
	model: Model,
    name: 'db_collection_name'
});

module.exports = new Collection();
```
## Models
```js
var Rotor = require('rotor-backbone');

var Model = Rotor.Model.extend({
    name: 'db_collection_name',

    defaults: {
		name: ''
	}
});

module.exports = Course;
```

In your router you can specify the Controller for each route and it will call the following methods:
```js
methods: {
    'GET': 'getCollection', //response - the collections JSON
    'POST': 'saveNew', //adds document to DB, response - added model JSON
    'PUT': 'saveUpdated', //updates document, response - updated model JSON
    'DELETE': 'deleteItem' //deletes document, response - deleted model JSON
    }
```
