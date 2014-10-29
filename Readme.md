ChannelsProvider - an abstraction on top of $rootScope and $scope.
Gives the ability to channel source state changes to an unknown target state.
Fire and forget mode.

All active channels should be defined on **config phase** using `createChannels`:
```
angular.module('app', [])
  .config(function(ChannelsProvider){
    ChannelsProvider.createChannels([
       'active1',
       'active2'
    ]);
  });
```

All method calls can be chained.
There can be several source states in the channel:
```javascript
Channels.get('myChannel')
  .link($scope)
  .from(state1, 'field1')
  .from(state2, 'field2')
  .with(function(sourceState, targetState){
    targetState.field = 'some modificiaton';
    return targetState;
  });
```

## Channels.get(name)

Return the channel with the given name

## channel.link(scope)

Links the given scope to the channel

## channel.from(sourceState, sourceField)

Create a link from the given `sourceState.sourceField` value.
This value will be observed and a change will be triggered if the value changes.

## channel.from(sourceState)

Create a link from the given `sourceState` object.
The object will be **deep watched**.
The change will be triggered if any field of the object changes.


## channel.from(sourceState, method)

Create a link from the given `sourceState.method` method.
The change will be triggered when **the method is called**.


## channel.with(fn)

Assign the **transform function** to the current link.
Transform function has a signature `(sourceState, targetState) -> targetState`.

When change is triggered in the channel, the transformation function will **overwrite `targetState` object** with a new one.

## channel.listen(scope, state)

Links the given state to all changes in the given scope.
Used to add a target state object to the channel.