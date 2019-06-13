import { Component } from '@angular/core';
import { AlertController, LoadingController, ToastController } from 'ionic-angular';
import { Platform } from 'ionic-angular';

export interface DeviceConfig {
  address: number;
  name: string;
  id: string;
  protocols: string[];
}

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private readonly CARRIAGE_DATA: string = '{ZC1}';
  public message: String = '';

  public pairedDevices: DeviceConfig[];
  public pairedDeviceId: number = 0;
  public weigherConfig: DeviceConfig;

  private bluetoothSerial;

  constructor(
    public loadCtrl: LoadingController,
    private alertCtrl: AlertController,
    private platform: Platform,
    private toastCtrl: ToastController
  ) {
    this.platform.ready().then(() => {
      this.bluetoothSerial = (<any>window).bluetoothClassicSerial;
      this.checkBluetoothEnabled();
    });
  }

  checkBluetoothEnabled() {
    this.bluetoothSerial.isEnabled(
      success => {
        this.refreshPairedDevices();
      },
      error => {
        this.showError('Please Enable Bluetooth');
      }
    );
  }

  refreshPairedDevices() {
    console.log('listing bluetooth devices');

    this.bluetoothSerial.list(
      pairedDevices => {
        console.log('list of bluetooth devices');

        for (let device of pairedDevices) {
          console.log('device', device);
        }

        this.pairedDevices = pairedDevices;
      },
      error => {
        console.log('error listing bluetooth devices', error);
        this.showError('Please Enable Bluetooth');
      }
    );
  }

  connectUnpairedDevice() {
    this.bluetoothSerial.discoverUnpaired(
      success => {
        console.log('list of bluetooth discoverUnpaired devices', success);

        for (let device of success) {
          console.log('discoverUnpaired device', device);
        }

        this.pairedDevices = success;
      },
      error => {
        console.log('error listing bluetooth devices', error);
        this.showError('Please Enable Bluetooth');
      }
    );
  }

  /* Connect Devices */
  connectDevice(weigher = false) {
    console.log('connect device called', weigher);
    const connectedDevice = this.pairedDevices[this.pairedDeviceId];
    const config: DeviceConfig = {
      id: connectedDevice.id,
      name: connectedDevice.name,
      address: connectedDevice.address,
      protocols: connectedDevice.protocols.filter(p => p !== '')
    };

    if (weigher) {
      this.weigherConfig = config;
      this.connect(config, weigher);
    } else {
      this.connect(config, weigher);
    }
  }

  /* Connect */
  connect(config: DeviceConfig, weigher = false) {
    const address = config.address;
    // Attempt to connect device with specified address, call app.deviceConnected if success
    console.log('This is the connected address:', config);
    this.showToast(`this is the connected address ${address}`);

    console.log('config', config.id, config.protocols);

    if (weigher) {
      this.bluetoothSerial.connect(
        config.id,
        config.protocols.filter(p => p !== ''),
        success => {
          console.log('Success address:', success);
          this.showToast(`Successfully Connected  ${address}`);
          this.deviceConnected(config.protocols[0], weigher);
        },
        error => {
          this.showError(`Error:Connecting to Device  ${address}`);
          console.log('error', error);
        }
      );
    } else {
      this.bluetoothSerial.connect(
        config.id,
        config.protocols.filter(p => p !== ''),
        success => {
          console.log('Success address:', success);
          this.showToast(`Successfully Connected  ${address}`);
          this.deviceConnected(config.protocols[0], weigher);
        },
        error => {
          this.showError(`Error:Connecting to Device  ${address}`);
          console.log('error', error);
        }
      );
    }
  }

  /* Device Connected */
  deviceConnected(interfaceId: string, weigher = false) {
    console.log('deviceConnected');

    if (weigher) {
      // Subscribe to data receiving as soon as the delimiter is read
      this.bluetoothSerial.subscribe(
        interfaceId,
        '\r',
        data => {
          const bytes = new Uint8Array(data);

          this.handleData(data);
          console.log('data', data);
          console.log('bytes', bytes);
          this.showToast('Connected Successfully');
        },
        error => {
          this.showError(error);
        }
      );
    } else {
      // Subscribe to data receiving as soon as the delimiter is read
      this.bluetoothSerial.subscribe(
        interfaceId,
        '\r',
        data => {
          const bytes = new Uint8Array(data);

          this.handleData(data);
          console.log('data', data);
          console.log('bytes', bytes);
          this.showToast('Connected Successfully');
        },
        error => {
          this.showError(error);
        }
      );
    }
  }

  /* Handle Data */
  handleData(data) {
    this.showToast(data);
    this.message += data;
  }

  // /* Disconnect */
  // disconnect() {
  //   this.showConnectReader = true;
  //   this.showDisconnectReader = false;

  //   let alert = this.alertCtrl.create({
  //     title: 'Disconnect?',
  //     message: 'Do you want to Disconnect?',
  //     buttons: [
  //       {
  //         text: 'Cancel',
  //         role: 'cancel',
  //         handler: () => {
  //           alert.dismiss();
  //         }
  //       },
  //       {
  //         text: 'Disconnect',
  //         handler: () => {
  //           this.bluetoothSerial.disconnect(success => {}, error => {}, this.address1);
  //         }
  //       }
  //     ]
  //   });
  //   alert.present();
  // }

  private write(data, interfaceId?: string) {
    let osSpecificInterfaceId;
    if (this.platform.is('android')) {
      osSpecificInterfaceId = '00001101-0000-1000-8000-00805F9B34FB';
    } else if (this.platform.is('ios')) {
      osSpecificInterfaceId = interfaceId;
    } else {
      alert('not supported');
      return;
    }

    this.bluetoothSerial.write(
      osSpecificInterfaceId,
      data,
      success => {
        this.showToast(success);
      },
      error => {
        this.showError(error);
      }
    );
  }

  requestWeight() {
    this.write(this.CARRIAGE_DATA, this.weigherConfig.protocols[0]); // enable carriage \n
    this.write('{RW}', this.weigherConfig.protocols[0]); // Tru-Test - yes  gallagher?   this is a live weight
  }

  requestStableWeight() {
    this.write(this.CARRIAGE_DATA, this.weigherConfig.protocols[0]); // enable carriage \n
    this.write('{RO}', this.weigherConfig.protocols[0]); // Tru-Test - yes  gallagher?   this is a live weight
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
}
