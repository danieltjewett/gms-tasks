# GMS Tasks - Steam

The purpose of the `steam-upload` command is for us to upload builds to Steam with a hassle free configuration.

The naïve Steam "SDK" way is prone to mistakes and a lot of manual configuration.  The goal is to reduce much of this with an easy-to-use, easy-to-read configuration.

The only main file we need to add / update is our `app.vdf` file (in the same folder as where gms-tasks-config.json is), which should have the form:

```
"AppBuild"
{
  "AppID" "<appId>" // your AppID
  "Desc" "" // internal description for this build
  
  "SetLive" "SomeBranch" // set this build live on beta branch

  "ContentRoot" "..\build\" // root content folder, relative to location where `npm run steam-upload` is
  "BuildOutput" ".\steam-logs\" // build output folder for build logs and build cache files.  This can be git ignored

  "Depots"
  {
    "<depotId>" // your DepotID
    {
      "FileMapping"
      {
        "LocalPath" ".\*" // This can be a full path, or a path relative to ContentRoot
        "DepotPath" "." // This is a path relative to the install folder of your game
        "recursive" "1" // include all subfolders
      }
    }
  }
}
```

## Installation

In the config file `gms-tasks-config.json`, we have these values that we can configure:

```
"steam-upload": {
  "sdkDir": "C:/Users/<username>/Desktop/sdk/",
  "simpleAppBuildVDF": "./app.vdf"
}
```

* `sdkDir` - the location of where the Steam SDK is on your computer
* `simpleAppBuildVDF` - the location of the simple app build vdf file relative to where this script is running

To protect our Steam `username` and `password` from being commited to version control, we've added support for `.env` variables.  Please make a `.env` file and store your credentials in this file.

The contents of `.env` should, as an example, look like this:

```
steam_username=username
steam_password="Password"
```

## Running

Run `npm run steam-upload` to run a command that uploads are builds to Steam.

*Note* - before running for the very first time, we should navigate to the `sdk/tools/ContentBuilder/builder/` directory and run `steamcmd.exe`.  In the prompt, run `login <username> <password>`.  This will then trigger Steam Guard to email with the code.  Type the code and then type `quit`.  We should be good to use this command now.

## Contributing

Thank you for considering contributing to GMS Tasks! To encourage active collaboration, we encourage pull requests, not just issues.

If you file an issue, the issue should contain a title and a clear description of the issue. You should also include as much relevant information as possible and a code sample that demonstrates the issue. The goal of a issue is to make it easy for yourself - and others - to replicate the bug and develop a fix.

## License

GMS Tasks is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT).
