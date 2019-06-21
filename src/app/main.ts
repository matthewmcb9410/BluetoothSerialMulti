import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app.module';

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady () {
  // Now safe to use device APIs
  platformBrowserDynamic().bootstrapModule(AppModule);
}
