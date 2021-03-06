import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BarcodeScanner} from '@ionic-native/barcode-scanner'
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { BluetoothDeviceConnectorService } from '../pages/home/bluetooth-device-connector.service';
import { HomePage } from '../pages/home/home';
import { MyApp } from './app.component';

@NgModule({
  declarations: [MyApp, HomePage],
  imports: [BrowserModule, IonicModule.forRoot(MyApp)],
  bootstrap: [IonicApp],
  entryComponents: [MyApp, HomePage],
  providers: [
    StatusBar,
    SplashScreen,
    BluetoothDeviceConnectorService,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    BarcodeScanner
  ]
})
export class AppModule {}
