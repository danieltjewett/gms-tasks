# GMS Tasks

Adds some command line tasks for repetitive actions for Game Maker Studio 2.  Current tasks include merging instances in several rooms into one room, stitching a world map from images, exporting all sprites from your project to sprite strips, making Game Maker sprites (`yy` files) from strip files, enabling and disabling rooms from the resource tree.

## Installation

This package requires NPM and Node.js, which can be downloaded at https://nodejs.org/en/download/ .  Once Node is installed, open up a terminal or cmd window and navigate to the directory where your game is installed and follow these steps:

1. In the terminal, run `npm install gms-tasks`.  This will add a node_modules directory (that can be ignored if using version control) and a package-lock.json file that should be kept / commited.

**NOTE**

For GMS 2.2, use version 0.2.
For GMS 2.3 and beyond, use the latest version.

2. Add this to the `scripts` in your `package.json` file:
```
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "export-gm-sprites-as-strips": "node node_modules/gms-tasks/tasks/export-gm-sprites-as-strips/index.js ./gms-tasks-config.json",
    "generate-map": "node node_modules/gms-tasks/tasks/generate-map/index.js ./gms-tasks-config.json",
    "make-gm-sprites-from-strips": "node node_modules/gms-tasks/tasks/make-gm-sprites-from-strips/index.js ./gms-tasks-config.json",
    "clean": "node node_modules/gms-tasks/tasks/clean/index.js ./gms-tasks-config.json && npm run enable-rooms",
    "build": "npm run clean && node node_modules/gms-tasks/tasks/build/index.js ./gms-tasks-config.json && npm run disable-rooms",
    "shift-positions": "node node_modules/gms-tasks/tasks/shift-positions/index.js ./gms-tasks-config.json",
    "disable-rooms": "node node_modules/gms-tasks/tasks/disable-rooms/index.js ./gms-tasks-config.json",
    "enable-rooms": "node node_modules/gms-tasks/tasks/enable-rooms/index.js ./gms-tasks-config.json",
	"steam-upload": "node node_modules/gms-tasks/tasks/steam-upload/index.js ./gms-tasks-config.json"
 },
 ```
 
As of 0.6.0, we decided to add `npm run disable-rooms` when running the `build` command (and the inverse `npm run enable-rooms` when running the `clean` command).  This is because 2022.5.0.8 seemed to enforce instance names in the room editor being unique across ALL rooms, and it has become easier to remove the rooms with the original, duplicate instances.
 
3. Assuming we want to use our own config file, in the terminal run run `cp ./node_modules/gms-tasks/gms-tasks-config.json gms-tasks-config.json`

## Tasks

To learn more about the individual tasks and how to configure them, each task has their own readme that can be read by clicking the tasks folder above.  Below is a list of the current tasks:

* Build - `npm run build`
* Clean - `npm run clean`
* Generate Map - `npm run generate-map`
* Export GM Sprites As Strips - `npm run export-gm-sprites-as-strips`
* Make GM Sprites From Strips - `npm run make-gm-sprites-from-strips`
* Shift Positions - `npm run shift-positions`
* Disable Rooms - `npm run disable-rooms`
* Enable Rooms - `npm run enable-rooms`
* Steam Upload - `npm run steam-upload`

## Contributing

Thank you for considering contributing to GMS Tasks! To encourage active collaboration, we encourage pull requests, not just issues.

If you file an issue, the issue should contain a title and a clear description of the issue. You should also include as much relevant information as possible and a code sample that demonstrates the issue. The goal of a issue is to make it easy for yourself - and others - to replicate the bug and develop a fix.

## License

GMS Tasks is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT).
