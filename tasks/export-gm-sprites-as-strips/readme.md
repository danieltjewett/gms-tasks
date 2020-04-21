# GMS Tasks - Export Game Maker Sprites as Strips

The purpose of the `export-gm-sprites-as-strips` command is to take all sprites in a Game Maker Studio 2 project and export them as strips.

## Installation

In the config file `gms-tasks-config.json`, we have these values that we can configure:

```
"export-gm-sprites-as-strips": {
    "spriteDirectory": "./sprites/",
    "exportDirectory": "./exported-strips/"
},
```

* `export-gm-sprites-as-strips` - these change the config values for this command
* `spriteDirectory` - the default sprite directory.  Shouldn't need to change
* `exportDirectory` - where we want to copy the exported strips to

## Running

Run `npm run export-gm-sprites-as-strips` to take all sprites and export them as strip images.

## Contributing

Thank you for considering contributing to GMS Tasks! To encourage active collaboration, we encourage pull requests, not just issues.

If you file an issue, the issue should contain a title and a clear description of the issue. You should also include as much relevant information as possible and a code sample that demonstrates the issue. The goal of a issue is to make it easy for yourself - and others - to replicate the bug and develop a fix.

## License

GMS Tasks is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT).
