import { ElementRef, Component, NgZone, HostListener, OnInit } from "@angular/core";
import { NavController } from "ionic-angular";
import { BluetoothSerial } from "@ionic-native/bluetooth-serial";
import { AlertController, LoadingController, ToastController } from "ionic-angular";
import { Platform } from "ionic-angular";

@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage implements OnInit {
  @HostListener('input', ['$event.target'])
  onInput(textArea:HTMLTextAreaElement):void {
    this.adjust();
  }

  output: any;
  message: String = "";
  responseTxt: any;
  unpairedDevices: any;
  pairedDevices: any;
  statusMessage: string;
  gettingDevices: Boolean;

  pairedList: pairedlist;
  listToggle: boolean = false;
  pairedDeviceID: number = 0;
  dataSend: string = "";


  showConnectReader: Boolean = true;
  showDisconnectReader: Boolean = false;
  showConnectWeigher: Boolean = true;
  showDisconnectWeigher: Boolean = false;

  constructor(
    public loadCtrl: LoadingController,
    private bluetoothSerial: BluetoothSerial,
    private alertCtrl: AlertController,
    public navCtrl: NavController,
    private ngZone: NgZone,
    private platform: Platform,
    private toastCtrl: ToastController,
    public element:ElementRef
  ) {
    bluetoothSerial.enable();
    this.checkBluetoothEnabled();
  }

  ngOnInit():void {
    setTimeout(() => this.adjust(), 0);
  }

  checkBluetoothEnabled() {
    this.bluetoothSerial.isEnabled().then(
      success => {
        this.listPairedDevices();
      },
      error => {
        this.showError("Please Enable Bluetooth");
      }
    );
  }

  listPairedDevices() {
    this.bluetoothSerial.list().then(
      success => {
        this.pairedList = success;
        this.listToggle = true;
      },
      error => {
        this.showError("Please Enable Bluetooth");
        this.listToggle = false;
      }
    );
  }

  selectDevice() {
    this.showConnectReader = false;
    this.showDisconnectReader = true;
    this.showConnectWeigher = false;
    this.showDisconnectWeigher = true;

    let connectedDevice = this.pairedList[this.pairedDeviceID];
    if (!connectedDevice.address) {
      this.showError("Select Paired Device to connect");
      return;
    }
    let address = connectedDevice.address;
    // let name = connectedDevice.name;

    this.connect(address);
  }

  connect(address) {
    // Attempt to connect device with specified address, call app.deviceConnected if success
    this.bluetoothSerial.connect(address).subscribe(
      success => {
        this.deviceConnected();
        this.showToast("Successfully Connected");
      },
      error => {
        this.showError("Error:Connecting to Device");
      }
    );
  }

  deviceConnected() {
    // Subscribe to data receiving as soon as the delimiter is read
    this.bluetoothSerial.subscribe("\r").subscribe(
    // this.bluetoothSerial.subscribe("").subscribe(
    // this.bluetoothSerial.subscribeRawData().subscribe(
      success => {
        var bytes = new Uint8Array(success);

        this.handleData(success);
        this.showToast("Connected Successfullly");
      },
      error => {
        this.showError(error);
      }
    );
  }

  handleData(data) {
    this.showToast(data);

    // let messageText = "\n" + data;
    this.message += data;
  }

  disconnect() {
    this.showConnectReader = true;
    this.showDisconnectReader = false;
    this.showConnectWeigher = true;
    this.showDisconnectWeigher = false;

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

  enableCarriage() {
    this.dataSend ='{ZC1}'; // enable carriage \n
    this.showToast(this.dataSend);

    this.bluetoothSerial.write(this.dataSend).then(success => {
      this.showToast(success);
    }, error => {
      this.showError(error)
    });
  }

  sendData() {
    this.enableCarriage();

    this.dataSend ='{RW}'; // trutest - yes  gallagher?   this is a live weight
    this.showToast(this.dataSend);

    this.bluetoothSerial.write(this.dataSend).then(success => {
      this.showToast(success);
    }, error => {
      this.showError(error)
    });
  }

  sendData1() {
    this.enableCarriage();

    this.dataSend ='{RO}'; // trutest - yes  gallagher?   this is a stable weight
    // this.dataSend ='{RS}'; // trutest - yes  gallagher?   this is a stable weight
    this.showToast(this.dataSend);

    this.bluetoothSerial.write(this.dataSend).then(success => {
      this.showToast(success);
    }, error => {
      this.showError(error)
    });
  }

  page() {}

  showError(error) {
    let alert = this.alertCtrl.create({
      title: "Error",
      subTitle: error,
      buttons: ["Dismiss"]
    });
    alert.present();
  }

  showToast(msj) {
    const toast = this.toastCtrl.create({
      message: msj,
      duration: 1000
    });
    toast.present();
  }

  adjust():void {
    const textArea = this.element.nativeElement.getElementsByTagName('textarea')[0];
    textArea.style.overflow = 'hidden';
    textArea.style.height = 'auto';
    textArea.style.height = textArea.scrollHeight + 'px';
    textArea.style.fontSize = "12px";
  }
}


interface pairedlist {
  "class": number,
  "id": string,
  "address": string,
  "name": string
}