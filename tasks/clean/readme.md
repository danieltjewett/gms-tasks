# GMS Tasks - Clean

The purpose of the `clean` command is "clean" the main room from the `build` command -- essentially reverting the main room to its former state.

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
"clean": {},
```

* `build-clean-snap` - these change the config values for the `build`, `clean` and `snap` commands
* `roomDir` - the default room directory.  Shouldn't need to change
* `exportRoom` - the name of the room you want all your instances to be merged to
* `copyRoomPattern` - the name of the rooms you want to copy from.  Everything after the last character of this string becomes a wildcard character.  For example, room_Kick_Hello would be copied
* `instanceCreationOrderId_InsertAt` - since initially all the original rooms are copies of each other, we have a few instances that are "global" that we shouldn't copy over in the instance creation tree.  For example, the player instance, a global instance, camera instance and a few others are present in every room.  A better way to think about this is the count of the instances that are present in each copy of the room.
* `layerToInsertName` - the name of the root layer where all instances are put
* `clean` - these change the config values for the `clean` command only

## Cleaning

Run `npm run clean` to remove all instances in your main room.  *Note* - we don't ever commit the main room to version control.  Cleaning before committing should be enforced.

## Contributing

Thank you for considering contributing to GMS Tasks! To encourage active collaboration, we encourage pull requests, not just issues.

If you file an issue, the issue should contain a title and a clear description of the issue. You should also include as much relevant information as possible and a code sample that demonstrates the issue. The goal of a issue is to make it easy for yourself - and others - to replicate the bug and develop a fix.

## License

GMS Tasks is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT).
