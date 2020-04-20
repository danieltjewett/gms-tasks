# GMS Tasks

Adds some command line tasks for repetitive actions for Game Maker Studio 2.  Current tasks include merging instances in several rooms into one room, stitching a world map from images, exporting all sprites from your project to sprite strips, making Game Maker sprites (yy files) from strip files.

## Installation

This package requires NPM and Node.js, which can be downloaded at https://nodejs.org/en/download/ .  Once Node is installed, open up a terminal or cmd window and navigate to the directory where your game is installed and follow these steps:

1. In the terminal, run `npm install gms-tasks`.  This will add a node_modules directory (that can be ignored if using version control) and a package-lock.json file that should be kept / commited .
2. Assuming we want to use our own config file, in the terminal run run `cp ./node_modules/gms-tasks/gms-tasks-config.json gms-tasks-config.json`

## Directory

To learn more about the individual tasks and how to configure them, each task has their own readme that can be read by clicking the links below:

* [Build](/tasks/build/) (`npm run build`)
* [Clean](/tasksclean/) (`npm run clean`)
* [Generate Map](/tasksgenerate-map/) (`npm run generate-map`)
* [Export GM Sprites As Strips](/tasksexport-gm-sprites-as-strips/) (`npm run export-gm-sprites-as-strips`)
* [Make GM Sprites From Strips](/tasksmake-gm-sprites-from-strips/) (`npm run make-gm-sprites-from-strips`)
* [Snap](/taskssnap/) (`npm run snap`)

## Contributing

Thank you for considering contributing to GMS Tasks! To encourage active collaboration, we encourage pull requests, not just issues.

If you file an issue, the issue should contain a title and a clear description of the issue. You should also include as much relevant information as possible and a code sample that demonstrates the issue. The goal of a issue is to make it easy for yourself - and others - to replicate the bug and develop a fix.

## License

GMS Tasks is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT).
