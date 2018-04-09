## Dashbordeau

Fullscreen dashboard with configurable auto-refresh intervals. 

![preview](./assets/images/preview.png "Dashbordeau preview")


## Build

Currently builds are macOS only.

Run `npm run package:mac` to package for mac.

Run `npm run build:mac` to package and generate a DMG file.

Run `npm run release` to generate a draft release and upload binaries to github.

Need to have `GH_TOKEN` set to publish.





<!--

Possible features:
* Support multiple screens
* Remote control. Have a client installed in a computer and control centrally.
* Fleet control.
* iBeacon broadcasting, so the companion app reacts changing content based on client.

electron-icon-maker -i assets/icons/src/dashbordeau-round.png -o assets/

https://www.christianengvall.se/electron-menu/
https://github.com/webtorrent/webtorrent-desktop/blob/62cb304971cb867e5923044df9b7afa2c5f35e78/main/updater.js
https://github.com/webtorrent/webtorrent.io/blob/master/server/desktop-api.js

high level wrapper for electron-build and electron-packager
https://electronforge.io/
-->