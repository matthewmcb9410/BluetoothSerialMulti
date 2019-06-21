import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { AlertController, LoadingController, Platform, ToastController } from 'ionic-angular';
import { BluetoothDeviceConnectorService } from './bluetooth-device-connector.service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
  public message: String = '';

  public reader;
  public data;
  public weigher;

  constructor(
    public loadCtrl: LoadingController,
    private alertCtrl: AlertController,
    private platform: Platform,
    private toastCtrl: ToastController,
    private readonly bluetoothDeviceConnector: BluetoothDeviceConnectorService,
    private readonly barcodeScanner: BarcodeScanner
  ) {}

  public async ngOnInit(): Promise<void> {
    await this.platform.ready();

    // const status = await this.barcodeScanner.prepare();
    console.log('status', status);
    // this.bluetoothDeviceConnector.initialise();

    // await this.startScan();
  }

  // public async scanQR() {
  //   const scannerStatus: barcodeScannerStatus = await this.barcodeScanner.prepare();

  //   if (scannerStatus.authorized) {
  //     // camera permission was granted

  //     // start scanning
  //     let scanSub = this.barcodeScanner.scan().subscribe((text: string) => {
  //       console.log('Scanned something', text);

  //       this.barcodeScanner.hide(); // hide camera preview
  //       scanSub.unsubscribe(); // stop scanning
  //     });
  //   } else if (scannerStatus.denied) {
  //     // camera permission was permanently denied
  //     // you must use barcodeScanner.openSettings() method to guide the user to the settings page
  //     // then they can grant the permission from there
  //   } else {
  //     // permission was denied, but not permanently. You can ask for permission again at a later time.
  //   }
  // }

  public async startScan() {
    try {
      const enabled = await this.bluetoothDeviceConnector.checkBluetoothEnabled();

      if (!enabled) {
        this.showError('Please enable bluetooth');
        return;
      }

      // const hasPermission = await this.bluetoothDeviceConnector.checkAndRequestBluetoothPermission();

      // if (!hasPermission) {
      //   this.showError('Needs bluetooth permission to connect with readers');
      // }

      await this.bluetoothDeviceConnector.refreshPairedDevices();

      try {
        this.reader = await this.bluetoothDeviceConnector.connectReader();
      } catch (err) {
        console.log('disconnecting');
        await this.bluetoothDeviceConnector.disconnect();
      }

      try {
        this.weigher = await this.bluetoothDeviceConnector.connectWeigher();
      } catch (err) {
        console.log('disconnecting');
        await this.bluetoothDeviceConnector.disconnect();
      }

      console.log('reader', this.reader);
      console.log('weigher', this.weigher);

      if (!this.reader || !this.weigher) {
        await this.bluetoothDeviceConnector.discoverUnpairedDevices();
      }

      if (!this.reader) {
        this.reader = await this.bluetoothDeviceConnector.connectReader();
      }

      console.log('reader 2', this.reader);

      if (!this.weigher) {
        this.weigher = await this.bluetoothDeviceConnector.connectWeigher();
      }

      console.log('weigher 2', this.weigher);

      if (this.reader) {
        this.bluetoothDeviceConnector.subscribeToReader().subscribe(value => {
          console.log('reader value', value);
          this.showToast(`reader value ${value}`);
        });
      }

      if (this.weigher) {
        this.bluetoothDeviceConnector.subscribeToWeigher().subscribe(value => {
          console.log('weigher value', value);
          this.showToast(`weigher value ${value}`);
        });
      }

      console.log('weigher 2 ', this.weigher);
    } catch (err) {
      this.showError(err.message);
    }
  }

  public async connectUnpairedDevice() {
    await this.bluetoothDeviceConnector.discoverUnpairedDevices();
  }

  public async requestWeight() {
    await this.bluetoothDeviceConnector.readWeight();
  }

  public async requestStableWeight() {
    await this.bluetoothDeviceConnector.readStableWeight();
  }

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

  public async scanQR() {
    console.log('scanning 2');
    console.log('this.barcodeScanner', this.barcodeScanner);
    console.log('this.barcodeScanner', Object.keys(this.barcodeScanner));
    const scanData = await this.barcodeScanner.scan();

    console.log('scanData', scanData);
    this.data = scanData.text;

    // await this.barcodeScanner.show();
    // window.document.querySelector('ion-app').classList.add('transparent-body');
    console.log('camera opened');
  }
}
