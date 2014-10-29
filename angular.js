'use strict';
var angular = require('angular');

module.exports = angular.module('am.channel', [

])
		.provider('Channels', require('./index'))
;
