import { ElementRef, Component, NgZone, HostListener, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AlertController, LoadingController, ToastController } from 'ionic-angular';
import { Platform } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
  @HostListener('input', ['$event.target'])
  onInput(textArea: HTMLTextAreaElement): void {
    this.adjust();
  }

  output: any;
  message: String = '';
  responseTxt: any;
  unpairedDevices: any;
  pairedDevices: any;
  statusMessage: string;
  gettingDevices: Boolean;

  pairedList: pairedlist;
  listToggle: boolean = false;
  pairedDeviceID: number = 0;
  dataSend: string = '';

  showConnectReader: Boolean = true;
  showDisconnectReader: Boolean = false;
  showConnectWeigher: Boolean = true;
  showDisconnectWeigher: Boolean = false;

  address1: string;
  address2: string;
  private bluetoothSerial;

  constructor(
    public loadCtrl: LoadingController,
    private alertCtrl: AlertController,
    public navCtrl: NavController,
    private ngZone: NgZone,
    private platform: Platform,
    private toastCtrl: ToastController,
    public element: ElementRef
  ) {
    this.platform.ready().then(() => {
      this.bluetoothSerial = window.bluetoothSerial;

      this.checkBluetoothEnabled();
    });
  }

  ngOnInit(): void {
    setTimeout(() => this.adjust(), 0);
  }

  checkBluetoothEnabled() {
    this.bluetoothSerial.isEnabled(
      success => {
        this.listPairedDevices();
      },
      error => {
        this.showError('Please Enable Bluetooth');
      }
    );
  }

  listPairedDevices() {
    this.bluetoothSerial.list(
      success => {
        this.pairedList = success;
        this.listToggle = true;
      },
      error => {
        this.showError('Please Enable Bluetooth');
        this.listToggle = false;
      }
    );
  }

  selectDevice() {
    this.showConnectReader = false;
    this.showDisconnectReader = true;

    let connectedDevice = this.pairedList[this.pairedDeviceID];

    if (!connectedDevice.address) {
      this.showError('Select Paired Device to connect');
      return;
    }
    let address = connectedDevice.address;
    this.address1 = address;

    this.connect(address);
  }

  selectDevice2() {
    this.showConnectWeigher = false;
    this.showDisconnectWeigher = true;

    let connectedDevice = this.pairedList[this.pairedDeviceID];
    if (!connectedDevice.address) {
      this.showError('Select Paired Device to connect');
      return;
    }
    let address = connectedDevice.address;
    this.address2 = address;

    this.connect(address);
  }

  connect(address) {
    // Attempt to connect device with specified address, call app.deviceConnected if success
    console.log('This is the connected address:', address);
    this.showToast(`this is the connected address ${address}`);

    this.bluetoothSerial.connect(
      address,
      success => {
        this.deviceConnected(address,
          );
        this.showToast(`Successfully Connected  ${address}`);
        console.log('Success address:', address);
      },
      error => {
        this.showError(`Error:Connecting to Device  ${address}`);
        console.log('Failure address:', address);
      }
    );
  }

  deviceConnected(address) {
    // Subscribe to data receiving as soon as the delimiter is read
    this.bluetoothSerial.subscribe(
      '\r',
      success => {
        var bytes = new Uint8Array(success);

        this.handleData(success);
        this.showToast('Connected Successfullly');
      },
      // error => {
      //   this.showError(error);
      // },
      address
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

    let alert = this.alertCtrl.create({
      title: 'Disconnect?',
      message: 'Do you want to Disconnect?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            alert.dismiss();
          }
        },
        {
          text: 'Disconnect',
          handler: () => {
            this.bluetoothSerial.disconnect(success => {}, error => {}, this.address1);
            this.gettingDevices = null;
          }
        }
      ]
    });
    alert.present();
  }

  disconnect2() {
    this.showConnectWeigher = true;
    this.showDisconnectWeigher = false;

    let alert = this.alertCtrl.create({
      title: 'Disconnect?',
      message: 'Do you want to Disconnect?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            alert.dismiss();
          }
        },
        {
          text: 'Disconnect',
          handler: () => {
            this.bluetoothSerial.disconnect(success => {}, error => {}, this.address2);
            this.gettingDevices = null;
          }
        }
      ]
    });
    alert.present();
  }
  next() {
    this.navCtrl.push('TerminalPage');
  }

  enableCarriage(address) {
    this.dataSend = '{ZC1}'; // enable carriage \n
    this.showToast(this.dataSend);

    this.bluetoothSerial.write(
      this.dataSend,
      success => {
        this.showToast(success);
      },
      error => {
        this.showError(error);
      },
      address
    );
  }

  sendData() {
    this.enableCarriage(this.address2);

    this.dataSend = '{RW}'; // trutest - yes  gallagher?   this is a live weight
    this.showToast(this.dataSend);

    this.bluetoothSerial.write(
      this.dataSend,
      success => {
        this.showToast(success);
      },
      error => {
        this.showError(error);
      },
      this.address2
    );
  }

  sendData1() {
    this.enableCarriage(this.address2);

    this.dataSend = '{RO}'; // trutest - yes  gallagher?   this is a stable weight
    // this.dataSend ='{RS}'; // trutest - yes  gallagher?   this is a stable weight
    this.showToast(this.dataSend);

    this.bluetoothSerial.write(
      this.dataSend,
      success => {
        this.showToast(success);
      },
      error => {
        this.showError(error);
      },
      this.address2
    );
  }

  page() {}

  showError(error) {
    let alert = this.alertCtrl.create({
      title: 'Error',
      subTitle: error,
      buttons: ['Dismiss']
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

  adjust(): void {
    const textArea = this.element.nativeElement.getElementsByTagName('textarea')[0];
    textArea.style.overflow = 'hidden';
    textArea.style.height = 'auto';
    textArea.style.height = textArea.scrollHeight + 'px';
    textArea.style.fontSize = '12px';
  }
}

interface pairedlist {
  class: number;
  id: string;
  address: string;
  name: string;
}
