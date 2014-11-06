ChannelsProvider - an abstraction on top of $rootScope and $scope.
Gives the ability to channel source state changes to an unknown target state.
Fire and forget mode.

The helper function which links the state objects and propagate change between them using the transformer function.

## What is 'channel'?

Channel is a helper to make one `state` react to changes in another `state`.  
It is used mainly to make relations between two [elements](https://github.com/mr-mig/am.element) located in different [composites](https://github.com/mr-mig/am.composite).

```javascript
Channels.get('myChannel')
  .link($scope)
  .from(state1, 'field1')
  .from(state2, 'field2')
  .with(function(targetState, sourceState){
    targetState.field3 = 'some modificiaton';
  });
```

The rule says:  
_Change the `targetState.field3` when `state1.field1` or `state2.field2` is changed._

## What is the difference between 'link' and 'channel'?

Roles:
* Link is used to relate two states in a single composite (e.g. button and a panel in a single form). 
* Channels is used to relate a known state and some **unknown state** in a different parts of the screen (e.g. button and a modal screen).

Lifecycle:
* Link can exist only locally inside a given composite.
* Channels can span over different composites across the screen.

## Conventions
* All active channels MUST be defined on **config phase** using `createChannels`:
```
angular.module('app', [])
  .config(function(ChannelsProvider){
    ChannelsProvider.createChannels([
       'active1',
       'active2'
    ]);
  });
```
* All method calls CAN be chained
* There CAN be several source states in the channel.
* Channel MUST be used to relate a known statea and an unknown state.
* The handler will be automatically destroyed when $scope is destroyed (controlled by framework).

## API

### Channels.get(name)

Return the channel with the given name

### channel.link(scope)

Links the given scope to the channel

### channel.from(sourceState, sourceField)

Create a link from the given `sourceState.sourceField` value.
This value will be observed and a change will be triggered if the value changes.

### channel.from(sourceState)

Create a link from the given `sourceState` object.
The object will be **deep watched**.
The change will be triggered if any field of the object changes.


### channel.from(sourceState, method)

Create a link from the given `sourceState.method` method.
The change will be triggered when **the method is called**.


### channel.with(fn)

Assign the **transform function** to the current link.
Transform function has a signature `(sourceState, targetState) -> targetState`.

When change is triggered in the channel, the transformation function will **overwrite `targetState` object** with a new one.

### channel.listen(scope, state)

Links the given state to all changes in the given scope.
Used to add a target state object to the channel.
