# Rumbling Universal Mayhem Plugin
(beta testing version)

A plugin that connects VTubeStudio to Intiface Engine, allowing it to forward linear and vibration inputs from any Buttplug.io-compatible software to VTubeStudio parameters. This allows a Vtuber avatar to respond to input from the Game Haptics Router as well as a number of game mods and other software.

## How to run
Unzip the package and run RUMP.exe. The embedded Intiface should initialize and connect automatically. Let me know if any errors show up there.

In the "VTuber Software Connection" section, enter your connection info if necessary (the defaults are usually fine) and click "Connect". If the connection succeeds, then you're ready to go!

## VTuber Setup
### VTubeStudio
When the plugin is connected to VTubeStudio, it will add "Vibrate" and "Linear" tracking INPUT parameters to VTubeStudio. Note that if this is your first time connecting to VTubeStudio, you will also need to click an authentication dialog in VTubeStudio itself.

In VTubeStudio, create a new parameter mapping to connect these INPUT parameters to one of your avatar's Live2D OUTPUT parameters. (more info about parameter setup available in the [VTubeStudio Manual](https://github.com/DenchiSoft/VTubeStudio/wiki/VTS-Model-Settings#vts-parameter-setup)). The Intiface Game Haptics Router and most other game mods will only use the "Vibrate" parameter.