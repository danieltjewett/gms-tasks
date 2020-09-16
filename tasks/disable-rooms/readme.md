# GMS Tasks - Disable Rooms

The purpose of the `disable-rooms` command is "disable" the rooms from the room tree (to enable later), to speed up builds. 

## Installation

In the config file `gms-tasks-config.json`, we have these values that we can configure:

```
"enable-disable-rooms": {
    "restoreDir": "./disabled-rooms/",
    "rooms": []
},
```

* `enable-disable-rooms` - these change the config values for the `enable-rooms` and `disable-rooms` commands
* `restoreDir` - the default restore directory.  Shouldn't need to change
* `rooms` - the list of room names that should be disabled (and of course, renabled)

## Disabling

Run `npm run disable-rooms` to disable the rooms from the resource tree.  Game Maker Studio should be reloaded and rooms will be unlinked from the project.  Room data will still be in the project folder.  It should be safe to commit these changes to version control, and is recommend to add the `restoreDir` directory to version control as well.  *Note* - we shouldn't mess with the room structure folder structure or enabling may not work.

## Contributing

Thank you for considering contributing to GMS Tasks! To encourage active collaboration, we encourage pull requests, not just issues.

If you file an issue, the issue should contain a title and a clear description of the issue. You should also include as much relevant information as possible and a code sample that demonstrates the issue. The goal of a issue is to make it easy for yourself - and others - to replicate the bug and develop a fix.

## License

GMS Tasks is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT).
