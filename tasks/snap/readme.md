# GMS Tasks - Snap

The purpose of the `snap` command is take all instances found within the `roomDir` and snap them to a grid.  Sometimes when copying / pasting large volumes of instances in the room editor, the grouping does not conform to the instance grid it was copied into.  This commmand will run and ensure all instances are placed correctly on a grid.

## Installation

In the config file `gms-tasks-config.json`, we have these values that we can configure:

```
"build-clean-snap": {
    "roomDir": "./rooms/",
    "exportRoom": "room_Kickstarter",
    "copyRoomPattern": "room_Kick_",
    "instanceCreationOrderId_InsertAt": 7,
    "layerToInsertName": "instances"
},
"snap": {
    "gridSize": 32,
    "ignoreRoomsSnap": [
      "room_Opening",
      "room_parent"
    ]
 }
```

* `build-clean-snap` - these change the config values for the `build`, `clean` and `snap` commands
* `roomDir` - the default room directory.  Shouldn't need to change
* `exportRoom` - (NOT USED IN THIS COMMAND) the name of the room you want all your instances to be merged to
* `copyRoomPattern` - (NOT USED IN THIS COMMAND) the name of the rooms you want to copy from.  Everything after the last character of this string becomes a wildcard character.  For example, room_Kick_Hello would be copied
* `instanceCreationOrderId_InsertAt` - (NOT USED IN THIS COMMAND) since initially all the original rooms are copies of each other, we have a few instances that are "global" that we shouldn't copy over in the instance creation tree.  For example, the player instance, a global instance, camera instance and a few others are present in every room.  A better way to think about this is the count of the instances that are present in each copy of the room.
* `layerToInsertName` - the name of the root layer where all instances are put
* `snap` - these change the config values for the `snap` command only
* `gridSize` - how big of a grid our tiles are on for our project
* `ignoreRoomsSnap` - an array of rooms to be excluded from the snap command

## Running

Run `npm run snap` to snap all instances in the found rooms.

## Contributing

Thank you for considering contributing to GMS Tasks! To encourage active collaboration, we encourage pull requests, not just issues.

If you file an issue, the issue should contain a title and a clear description of the issue. You should also include as much relevant information as possible and a code sample that demonstrates the issue. The goal of a issue is to make it easy for yourself - and others - to replicate the bug and develop a fix.

## License

GMS Tasks is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT).
