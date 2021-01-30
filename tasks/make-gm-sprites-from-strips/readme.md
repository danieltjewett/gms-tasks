# GMS Tasks - Make Game Maker Sprites from Strips

The purpose of the `make-gm-sprites-from-strips` command is to take (very many) strip images and import them into Game Maker very quickly.  For example, let's say we generated many characters from http://gaurav.munjal.us/Universal-LPC-Spritesheet-Character-Generator/  To import each individual row into Game Maker for many strips is very time consuming.  This task will speed up that process.

## Installation

In the config file `gms-tasks-config.json`, we have these values that we can configure:

```
"make-gm-sprites-from-strips": {
    "grid": 32,
    "animations": {
      "Walk_Up": {
        "index": 8,
        "frames": 9
      },
      "Walk_Left": {
        "index": 9,
        "frames": 9
      },
      "Walk_Down": {
        "index": 10,
        "frames": 9
      },
      "Walk_Right": {
        "index": 11,
        "frames": 9
      },
      "Death": {
        "index": 20,
        "frames": 6
      },
      "Hurt": {
        "index": 20,
        "frames": 3
      },
      "Unhurt": {
        "index": 20,
        "frames": 3,
        "reverse": true
      }
    },
    "prefixStr": "spr_NPC_",
    "stripDirectory": "./strips/",
    "outputDirectory": "./yy/",
    "spritesFolder": "Sprites"
},
```

* `make-gm-sprites-from-strips` - these change the config values for this command
* `animations` - a list of animations to create from the strip
* `Animation_Name` - the name of the animation to make from the strip image
* `index` - the row of the strip to read from (zero based)
* `frames` - how many frames to read from that row
* `reverse` - whether to create the sprite with the frames reversed
* `prefixStr` - the prefix to name the sprite (will be concantated with Animation_Name)
* `stripDirectory` - the directory where all the strips are stored
* `exportDirectory` - the directory where the Game Maker Studio 2 sprites will be generated
* `spritesFolder` - the directory where the Game Maker Studio 2 sprites ultimately will go

## Import into Game Maker Studio 2

We still have to import each yy file individually, but it will be faster than using the strip importer for each individual direction and sprite.  To do so, right click on Sprites and choose `Add Existing`.  Navigate to our `outputDirectory` and for each sprite, import the `.yy` file.

## Running

Run `npm run make-gm-sprites-from-strips` to take a directory of strips and turn them into Game Maker Studio 2 sprite files.  *Note* - unlike other tasks, this task is probably better running outside your game's project directory.  We can run `npm install gms-tasks` in our directory with our strip images and then run the command in that directory to get our output.

## Contributing

Thank you for considering contributing to GMS Tasks! To encourage active collaboration, we encourage pull requests, not just issues.

If you file an issue, the issue should contain a title and a clear description of the issue. You should also include as much relevant information as possible and a code sample that demonstrates the issue. The goal of a issue is to make it easy for yourself - and others - to replicate the bug and develop a fix.

## License

GMS Tasks is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT).
