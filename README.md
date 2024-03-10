# Rumbling Universal Mayhem Plugin (RUMP)
(beta testing version)

A plugin that connects VTubeStudio to Intiface Engine, allowing it to forward linear and vibration inputs from any Buttplug.io-compatible software to VTubeStudio parameters. This allows a Vtuber avatar to respond to input from the Game Haptics Router as well as a number of game mods and other software.

## How to run
Unzip the package and run rump.exe. The embedded Intiface should initialize and connect automatically. Let me know if any errors show up there.

In the "VTuber Software Connection" section, enter your connection info if necessary (the defaults are usually fine) and click "Connect". If the connection succeeds, then you're ready to go!

## VTuber Setup
In the "VTuber Software Connection" section, there is a dropdown box allowing you to choose between VTubeStudio, VNyan, and Warudo. When you choose one, the connection info box will automatically be populated with that software's default connection port.
### VTubeStudio
If this is your first time connecting this plugin to VTubeStudio, connecting will pop up an authentication dialog in VTubeStudio itself, which you must accept in order to use the plugin.

When the plugin is connected to VTubeStudio, it will add "Vibrate" and "Linear" tracking INPUT parameters to VTubeStudio. In VTubeStudio, create a new parameter mapping to connect these INPUT parameters to one of your avatar's Live2D OUTPUT parameters. (more info about parameter setup available in the [VTubeStudio Manual](https://github.com/DenchiSoft/VTubeStudio/wiki/VTS-Model-Settings#vts-parameter-setup)). The Intiface Game Haptics Router and most other game mods will only use the "Vibrate" parameter.

The data being sent to VTubeStudio will be in a range of 0-1, with 0 representing 0% vibration and 1 representing 100% vibration. The values will be resent regularly at <1sec intervals, to prevent the custom tracking data from expiring.

### VNyan and Warudo
In both VNyan and Warudo, you can receive this data using Websocket nodes in these programs' node graphs, and use it in any node setup you create. In VNyan, make sure to turn Websockets on in the settings.

Your node command/title should be "Vibrate" and/or "Linear". The data will be provided in a range of 0-100, with 0 representing 0% vibration and 100 representing 100% vibration. Unlike VTubeStudio, there is no automatic resending; each individual value will only be sent once.

## Logging
When you run the application, log files will be produced in `resources/logs`. By default, two log files will be created - `rump.log`, which logs the application's events, and `intiface.log`, which contains Intiface Engine logging. If you set "debug" to `true` in `settings.json`, a third config file will be generated which contains more detailed logging, `debug.log`. 

New log files will be started each day or when the log files hit 10MB in size. Three days worth of log files will be stored; any older ones will be deleted automatically.

## Settings
In the `resources/config` folder, you will find a file `settings.json`. This file can be used to turn on debug logging. Don't touch the other options right now, they sit somewhere between "not working yet" and "probably going to be removed".