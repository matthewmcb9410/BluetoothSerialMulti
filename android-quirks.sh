#!/bin/bash

# reference
# https://github.com/ionic-team/ionic-app-scripts/issues/1354


echo "Writing workaround for Android build issue"

sed -i .bak "s/exports.ANDROID_PLATFORM_PATH = path.join.*$/exports.ANDROID_PLATFORM_PATH = path.join('platforms', 'android', 'app', 'src', 'main', 'assets', 'www');/g" node_modules/@ionic/app-scripts/dist/dev-server/serve-config.js
rm node_modules/@ionic/app-scripts/dist/dev-server/serve-config.js.bak

echo "Android platform config updated."
