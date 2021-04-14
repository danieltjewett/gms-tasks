# GMS Tasks - Shift Positions

The purpose of the `shift-positions` command is take all instances found within the `roomDir` and shift their positions.

## Installation

In the config file `gms-tasks-config.json`, we have these values that we can configure:

```
"shift-positions": {
    "roomDir": "./rooms/",
    "copyRoomPattern": "room_Kick_",
    "left": 100,
    "top": 100,
    "ignoreRooms": [
      "room_Opening",
      "room_parent"
    ]
 }
```

* `shift-positions` - these change the config values for this command
* `roomDir` - the default room directory.  Shouldn't need to change
* `copyRoomPattern` - the name of the rooms you want to shift instances positions from.  Everything after the last character of this string becomes a wildcard character.  For example, 
* `left` - how much to move all the instances to the left by
* `top` - how much to move all the instances to the top by
* `gridSize` - how big of a grid our tiles are on for our project
* `gridSize` - how big of a grid our tiles are on for our project
* `ignoreRooms` - an array of rooms to be excluded from the shift-positions command

## Running

Run `npm run shift-positions` to shift positions to all instances in the found rooms.

## Contributing

Thank you for considering contributing to GMS Tasks! To encourage active collaboration, we encourage pull requests, not just issues.

If you file an issue, the issue should contain a title and a clear description of the issue. You should also include as much relevant information as possible and a code sample that demonstrates the issue. The goal of a issue is to make it easy for yourself - and others - to replicate the bug and develop a fix.

## License

GMS Tasks is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT).
