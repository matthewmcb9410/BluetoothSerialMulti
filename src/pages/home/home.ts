import { Component, NgZone } from "@angular/core";
import { NavController } from "ionic-angular";
import { BluetoothSerial } from "@ionic-native/bluetooth-serial";
import { AlertController, LoadingController } from "ionic-angular";
import { Platform } from "ionic-angular";

@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage {
  output: any;
  message: String;
  responseTxt: any;
  unpairedDevices: any;
  pairedDevices: any;
  statusMessage: string;
  gettingDevices: Boolean;
  constructor(
    public loadCtrl: LoadingController,
    private bluetoothSerial: BluetoothSerial,
    private alertCtrl: AlertController,
    public navCtrl: NavController,
    private ngZone: NgZone,
    private platform: Platform
  ) {
    bluetoothSerial.enable();
  }

  startScanning() {
    if (this.platform.is("cordova")) {
      this.pairedDevices = null;
      this.unpairedDevices = null;
      this.gettingDevices = true;
      this.bluetoothSerial.discoverUnpaired().then(
        success => {
          this.unpairedDevices = success;
          this.gettingDevices = false;
          success.forEach(element => {});
        },
        err => {
          console.log(err);
        }
      );

      this.bluetoothSerial.list().then(
        success => {
          this.pairedDevices = success;
        },
        err => {}
      );
    } else {
    }
  }
  success = data => alert(data);
  fail = error => alert(error);

  selectDevice(address: any) {
    let alert = this.alertCtrl.create({
      title: "Connect",
      message: "Do you want to connect with?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          handler: () => {
            console.log("Cancel clicked");
          }
        },
        {
          text: "Connect",
          handler: () => {
            this.bluetoothSerial
              .connect(address)
              .subscribe(this.success, this.fail);
          }
        }
      ]
    });
    alert.present();
  }

  disconnect() {
    let alert = this.alertCtrl.create({
      title: "Disconnect?",
      message: "Do you want to Disconnect?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          handler: () => {
            alert.dismiss();
          }
        },
        {
          text: "Disconnect",
          handler: () => {
            this.bluetoothSerial.disconnect();
            this.gettingDevices = null;
          }
        }
      ]
    });
    alert.present();
  }
  next() {
    this.navCtrl.push("TerminalPage");
  }

  data() {
    if (this.platform.is("cordova")) {
      setInterval(() => {
        this.read1();
      }, 3000);
    }
  }

  read() {
    this.bluetoothSerial.read().then(data => {
      this.message = data;
    });
  }

  read1() {
    this.ngZone.run(() => {
      this.read();
    });
  }

  page() {}
}
