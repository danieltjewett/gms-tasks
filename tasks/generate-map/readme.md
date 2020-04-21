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
* `imagesDirectory` - the directory of where your generated images from your game are located.  My project is located on my desktop, so this relative path gets us to where Game Maker stores local data by default
* `outputDirectory` - the directory where the final map image will be located
* `finalWidth` - the width of the map image
* `finalHeight` - the height of the map image

## Code for Game Maker Studio 2

We need to create a map generator object in Game Maker to generate our initial images to be stitched.  Follow these steps:

1. Create an object called obj_MapGenerator
2. Add this code below for the `create event`.  In the tweak stuff region, either remove this entirely, or replace these `with`'s with default states of objects in the game.  Basically, do you want to "draw" something?  If not, do your logic here.  Also, `ZONE_WIDTH` and `ZONE_HEIGHT` are constants in my game.  Replace these with numbers that you want to capture your initial images at.  My game uses 480x480 for these.  These sizes shouldn't be too big.

```
#region set flag

flag = false;

#endregion
#region tweak stuff

with (noone)
{
    visible = false;
}

//NOTE - ANYTHING YOU DON'T WANT ON YOUR MAP, ADD HERE

#endregion
#region initialize surface

surfaceAll = surface_create(ZONE_WIDTH, ZONE_HEIGHT);

#endregion
```

3. Add this code below for the `begin step event`.  Assuming your open world activates / deactives things, we want EVERYTHING to be activated for the drawer.

```
#region override object activation

instance_activate_all();

#endregion
```

4. Add this code below for the `draw event`.  We have a couple of things that could be updated or removed.  First, if you have any backgrounds, update the name of your background layer from `bg_overlay` to whatever it's called in your game.  Second, `TILE_GRID` are constants in my game.  Replace these with numbers that represent your grid size.  If we aren't using tiles, you can remove the `part 1, tiles` code block.

```
#region draw it

var rowIndex=0;
var imageIndex=10000;

var xx = 0;
var yy = 0;

var list = ds_list_create();
var renderList = ds_list_create();
var renderSize = 0;

var bgOverlayLayer = layer_get_id("bg_overlay");
var tileMapId = layer_tilemap_get_id(bgOverlayLayer);

if (flag && surface_exists(surfaceAll))
{
    while (yy < room_height)
    {
        while (xx < room_width)
        {
            surface_set_target(surfaceAll);
            draw_clear_alpha(c_white, 0);
      
            //part 1, tiles
            for (var i=0; i<ZONE_WIDTH / TILE_GRID; i++)
            {
              for (var j=0; j<ZONE_HEIGHT / TILE_GRID j++)
              {
                var tileData = tilemap_get(tileMapId, floor(xx / TILE_GRID) + i, floor(yy / TILE_GRID) + j);
                draw_tile(tls_overlay_backgrounds, tileData, 0, i * TILE_GRID, j * TILE_GRID)
              }
            }
            //
      
            //part 2, objects
            //go through instances in a rectangle
            //if in rect, see if they are still allowed to be rendered
            //if so insert a sorted list based on depth
            var size = collision_rectangle_list(xx - ZONE_WIDTH, yy - ZONE_HEIGHT, xx + ZONE_WIDTH * 2, yy + ZONE_HEIGHT * 2, all, false, true, list, false);
            for (var i=0; i<size; i++)
            {
              var inst = list[| i];
              
              //TODO may want to update this so it isn't using mask -- look at cameras algorithm for getting instances in a list
              if (inst.visible && inst.sprite_index != -1 && instance_in_rectangle(inst, true, xx, yy, xx + ZONE_WIDTH, yy + ZONE_HEIGHT))
              {
                for (var j=0; j<renderSize; j++)
                {
                  if (renderList[| j].depth >= inst.depth)
                  {
                    ds_list_insert(renderList, j, inst);
                    renderSize ++;
                    break;
                  }
                }
                
                ds_list_add(renderList, inst);
                renderSize ++;
              }
            }
            
            //render onto the target
            for (var i=renderSize - 1; i>=0; i--)
            {
              var inst = renderList[| i];
              
              var myX = inst.x - xx;
              var myY = inst.y - yy;
              
              draw_sprite_ext(inst.sprite_index, inst.image_index, myX, myY, inst.image_xscale, inst.image_yscale, 0, -1, 1);
            }
            //
            
            surface_reset_target();
            surface_save(surfaceAll, "map-images/" + string_pad(rowIndex, 5, "0") + "/" + string(imageIndex) + ".png");
            
            imageIndex++;
            xx += ZONE_WIDTH;
      
            ds_list_clear(list);
            ds_list_clear(renderList);
            renderSize = 0;
        }
    
        rowIndex ++;
        
        yy += ZONE_HEIGHT;
        xx = 0;
    }
    
    game_end();
}

ds_list_destroy(list);
ds_list_destroy(renderList);

flag = true;

#endregion
```

5. Add the map generator instance to our room
6. Run the game.  It will generate our map images to be stitched.

## Running

Run `npm run generate-map` to the generated images from above and stitch a map image for your open world game.  If you don't want the image to be using the sepia filter, or to be compressed to the `finalWidth` / `finalHeight` sizes, the output before the final output is also saved to be manipulated elsewhere to your liking.  *Note* - if using version control, the map directory created does not have to be committed.

## Contributing

Thank you for considering contributing to GMS Tasks! To encourage active collaboration, we encourage pull requests, not just issues.

If you file an issue, the issue should contain a title and a clear description of the issue. You should also include as much relevant information as possible and a code sample that demonstrates the issue. The goal of a issue is to make it easy for yourself - and others - to replicate the bug and develop a fix.

## License

GMS Tasks is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT).
