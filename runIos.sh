#!/bin/bash

cordova remove ios
cordova add ios
npm i

sed -i .bak "s/declare var cordova: Cordova$/declare var cordova: any;/g" node_modules/@types/cordova/index.d.ts
rm node_modules/@types/cordova/index.d.ts.bak

ionic cordova run ios --l -- --buildFlag='-UseModernBuildSystem=0'
