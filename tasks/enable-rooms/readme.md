# GMS Tasks - Enable Rooms

The purpose of the `enable-rooms` command is "enable" the rooms that were disabled from the `disable-rooms` command -- essentially reversing the command.

## Installation

In the config file `gms-tasks-config.json`, we have these values that we can configure:

```
"enable-disable-rooms": {,
    "restoreDir": "./disabled-rooms/",
    "rooms": []
},
```

* `enable-disable-rooms` - these change the config values for the `enable-rooms` and `disable-rooms` commands
* `restoreDir` - the default restore directory.  Shouldn't need to change
* `rooms` - the list of room names that should be disabled (and of course, renabled)

## Enabling

Run `npm run enable-rooms` to restore rooms back into the asset browser.  Game Maker Studio should be reloaded and rooms will be relink back into project.

## Contributing

Thank you for considering contributing to GMS Tasks! To encourage active collaboration, we encourage pull requests, not just issues.

If you file an issue, the issue should contain a title and a clear description of the issue. You should also include as much relevant information as possible and a code sample that demonstrates the issue. The goal of a issue is to make it easy for yourself - and others - to replicate the bug and develop a fix.

## License

GMS Tasks is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT).
