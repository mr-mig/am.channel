'use strict';
var angular = require('angular-cjs');
var channels = require('./index');

// register channels provider using angular DI container
module.exports = angular.module(channels.moduleName, [])
  .provider(channels.entityName, channels.factoryFn);
