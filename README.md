# VTuber Plug-In
(beta testing version)

A plugin that connects VTubeStudio to Intiface Engine, allowing it to forward linear and vibration inputs from any Buttplug.io-compatible software to VTubeStudio parameters. This allows a Vtuber avatar to respond to input from the Game Haptics Router as well as a number of game mods and other software.

## How to run
This is currently a pure command-line NodeJS application. Making this a standalone GUI application is planned, but is not yet complete.

To run it, you must have NodeJS installed, start up your Vtuber software, and execute this command from your command-line:
> node bundle.js

Runtime configuration and controls have not yet been implemented, so you **must** open VTubeStudio *before* starting the program, as it will only attempt to connect when the plugin is first started. If connection to VTubeStudio or Intiface fails, or if the connection is lost later, the program will close.

## VTuber Setup
### VTubeStudio
When the plugin is run for the first time, it will add "Vibrate" and "Linear" tracking INPUT parameters to VTubeStudio. In VTubeStudio, create a new parameter mapping to connect these INPUT parameters to one of your avatar's Live2D OUTPUT parameters. (more info about parameter setup available in the [VTubeStudio Manual](https://github.com/DenchiSoft/VTubeStudio/wiki/VTS-Model-Settings#vts-parameter-setup)). The Intiface Game Haptics Router and most other game mods will only use the "Vibrate" parameter.

## Settings
In the `config` folder, you will find a file `settings.json`. Here you can set the hostname and port for your Vtuber software. If you want to use Intiface Central instead of the embedded Intiface Engine, you can set intiface.use-local to false, but note that you will experience issue #1 when using Intiface Central.