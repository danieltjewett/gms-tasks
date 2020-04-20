# GMS Tasks - Generate Map

The purpose of the `generate-map` command is generate (stitch) a map image from a open world game.

## Installation

Unfortunately this command takes an additional library to work.  Please install [GraphicsMagick](http://www.graphicsmagick.org/download.html) to use this command.

In the config file `gms-tasks-config.json`, we have these values that we can configure:

```
"generate-map": {
    "imagesDirectory": "../../AppData/Local/violetthegame/map-images/",
    "outputDirectory": "./map/",
    "finalWidth": 960,
    "finalHeight": 960
},
```

* `generate-map` - these change the config values for this command
* `imagesDirectory` - the directory of where your generated images from your game are located
* `outputDirectory` - the directory where the final map image will be located
* `finalWidth` - the width of the map image
* `finalHeight` - the height of the map image

## Code for Game Maker Studio 2

We need to create a map generator object in Game Maker to generate our initial images to be stitched.  Follow these steps:

1. Create an object called obj_MapGenerator
2. Add this code below for the `create event`.  In the delete stuff region, either remove this entirely, or replace these `with`'s with default states of objects in the game.  Basically, do you want to "draw" something?  If not, do your logic here.  Also, `ZONE_WIDTH` and `ZONE_HEIGHT` are constants in my game.  Replace these with numbers that you want to capture your initial images at.  My game uses 480x480 for these.  These sizes shouldn't be too big.

```
#region set flag

flag = false;

#endregion
#region delete stuff

with (obj_WallMassWall)
{
  //we do want to destroy this immediately
  instance_destroy(self, false);
}

with (obj_Building)
{
  //we do want to destroy this immediately
  instance_destroy(self, false);
}

with (obj_WaterTile)
{
  visible = true; 
  depth = WATER_DEPTH; //water tile doesn't have a depth, but manager does.  So we need set the depth from the manager
}

with (obj_Living)
{
    visible = false;
}

with (obj_Torch)
{
    visible = false;
}

with (obj_Chest)
{
    visible = false;
}

with (obj_ItemData)
{
  visible = false;  
}

with (obj_HouseSeeThroughObjects)
{
  visible = false;  
}

with (obj_HouseSolidObjects)
{
  visible = false;  
}

#endregion
#region initialize surface

surfaceAll = surface_create(ZONE_WIDTH, ZONE_HEIGHT);

#endregion
```

3. Add this code below for the `begin step event`

```
#region override object activation

instance_activate_all();

#endregion
```

4. Add this code below for the `draw event`

```
#region draw it

//TODO add code

#endregion
```

5. Add the map generator instance to our room
6. Run the game.  It will generate our map images to be stitched.

## Building

Run `npm run generate-map` to the generated images from above and stitch a map image for your open world game.  If you don't want the image to be using the sepia filter, or to be compressed to the `finalWidth` / `finalHeight` sizes, the output before the final output is also saved to be maniuplated elsewhere to your liking.

## Contributing

Thank you for considering contributing to GMS Tasks! To encourage active collaboration, we encourage pull requests, not just issues.

If you file an issue, the issue should contain a title and a clear description of the issue. You should also include as much relevant information as possible and a code sample that demonstrates the issue. The goal of a issue is to make it easy for yourself - and others - to replicate the bug and develop a fix.

## License

GMS Tasks is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT).
