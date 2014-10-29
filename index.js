'use strict';
module.exports = ChannelsProvider;

// global registry
var Channels = {};


// accessor function
// allows non-existent channels usage
// gives sane warning message
Channels.get = function(name){
	if (!Channels[name]) {
		console.log('Warning! The non-existent channel is accessed: ' + name + '.\n' +
				'This is potentially abnormal situation: all active channels should ' +
				'be created using ChannelsProvider.createChannels(<array>).');
		return new Channel(name);
	}

	return Channels[name];
};

function Channel(name) {
	// channel name
	this.name = name;

	// all scopes linked to this channel
	this.scopes = [];

	// all source states linked to this channel
	this.src = [];

	// all target states linked to this channel
	this.tgt = [];

	// transformation function
	// (sourceState, targetState) -> targetState
	this.transform = function (nothing, x) {
		return x;
	};
}

// angular-specific provider format
function ChannelsProvider() {

	function add(name) {
		Channels[name] = new Channel(name);
	}

	// this should be called during app startup to create the given channels
	this.createChannels = function (array) {
		array.forEach(add);
	};

	this.$get = ['$rootScope', ChannelFactory];
}


function ChannelFactory($rootScope) {


	// links the given scope to this channel
	// any change will be propagated to this scope
	Channel.prototype.link = function (scope) {
		if (this.scopes.indexOf(scope) > -1) {
			return;
		}

		this.scopes.push(scope);
		return this;
	};

	Channel.prototype.from = function (state, field) {
		if (!this.scopes.length) {
			throw new Error('Channel' + this.name + 'is not linked to any scope!\n' +
					'All active channels should be linked to at least one scope to be able to watch state changes.' +
					'Use channel.link(scope)');
		}

		this.src.push({
			state: state,
			field: field
		});


		if (typeof state[field] === 'function') {
			return this.fromFn(state, field);
		}

		var watched = function () {
			return state[field];
		};

		if (!field) watched = function () {
			return state;
		};

		var watchHandler = function (n, o) {
			if (n !== o) {
				this._dispatch(n);
			}
		}.bind(this);

		var scope = this.scopes[this.scopes.length - 1];

		//deep watch object if no field defined
		scope.$watch(watched, watchHandler, !field);

		return this;
	};

	Channel.prototype.fromFn = function (state, fnName) {
		// remember old function
		var oldFn = state[fnName];

		// hijack with decorator
		state[fnName] = function () {
			var args = [].slice.apply(arguments);

			var result = oldFn.apply(state, args);

			// dispatch change when this method is called
			this._dispatch(result);
		}.bind(this);

		return this;
	};

	Channel.prototype._dispatch = function (sourceState) {
		$rootScope.$broadcast(this.name, sourceState);
	};

	Channel.prototype.with = function (fn) {
		// sourceState, targetState -> targetState
		this.transformer = fn;
		return this;
	};

	// Bind the given state to all changes in this channel
	Channel.prototype.listen = function (targetScope, state) {
		var listenTarget = {
			state: state,
			scope: targetScope
		};

		this.tgt.push(listenTarget);

		// binding to target scope so that listener deregisters automatically
		return targetScope.$on(this.name, function (event, sourceState) {
			state = this.transformer(state, sourceState);
		}.bind(this));
	};

	return Channels;
}