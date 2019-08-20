import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { AlertController, LoadingController, Platform, ToastController } from 'ionic-angular';
import { BluetoothDeviceConnectorService } from './bluetooth-device-connector.service';
// import { BluetoothLE } from '@ionic-native/bluetooth-le';
import { BLE } from '@ionic-native/ble';

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
    private readonly barcodeScanner: BarcodeScanner,
    // public bluetoothLe: BluetoothLE,
    private ble: BLE
  ) {}

  public async ngOnInit(): Promise<void> {
    await this.platform.ready();

    // try {
    //   // const status = await this.barcodeScanner.prepare();
    //   console.log('status', status);
    //   // this.bluetoothDeviceConnector.initialise();

    //   const ble = await this.bluetoothLe.initialize();
    //   console.log('ble', ble.status); // logs 'enabled'

    //   this.bluetoothLe
    //     .startScan(
    //       // data => {
    //       //   console.log('data', data);
    //       // }
    //       // err => {
    //       //   console.log('err', err);
    //       // }
    //       {}
    //     )
    //     .subscribe((data: any) => {
    //       console.log('data', data.name);
    //       console.log('data', data.advertisement.manufacturerData);

    //       if (data.name.indexOf('SDL440') !== -1) {
    //         this.bluetoothLe.connect({ address: data.address }).subscribe(data2 => {
    //           console.log('data2', data2);
    //         });
    //       }
    //     });
    // } catch (err) {
    //   console.log('err', err);
    // }
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

  // public async connectReader() {
  //   try {
  //     // const status = await this.barcodeScanner.prepare();
  //     // console.log('status', status);
  //     // this.bluetoothDeviceConnector.initialise();

  //     const ble = await this.bluetoothLe.initialize();
  //     console.log('ble', ble.status); // logs 'enabled'

  //     this.bluetoothLe
  //       .startScan(
  //         // data => {
  //         //   console.log('data', data);
  //         // }
  //         // err => {
  //         //   console.log('err', err);
  //         // }
  //         {}
  //       )
  //       .subscribe((data: any) => {
  //         console.log(
  //           'name',
  //           data.name,
  //           'manufacturer',
  //           data.advertisement && data.advertisement.manufacturerData,
  //           'serviceUuids',
  //           data.advertisement && data.advertisement.serviceUuids
  //         );

  //         if (data.name && data.name.indexOf('SDL') !== -1) {
  //           console.log('found it', data);
  //           this.bluetoothLe.connect({ address: data.address }).subscribe(async (data2: any) => {
  //             console.log('data2', data2);
  //             this.bluetoothLe.stopScan();

  //             const services = await this.bluetoothLe.services({ address: data.address });
  //             console.log('services', services);

  //             const discover = await this.bluetoothLe.discover({ address: data.address });
  //             console.log('discover', discover);

  //             console.log('characteristics with', {
  //               characteristics: [],
  //               address: data.address,
  //               service: services.services[0]
  //             });

  //             let characteristics;
  //             try {
  //               characteristics = await this.bluetoothLe.characteristics({
  //                 characteristics: [],
  //                 address: data.address,
  //                 service: services[0]
  //               });
  //             } catch (err) {
  //               console.log('err', err);
  //               console.log('characteristics with', {
  //                 characteristics: [],
  //                 address: data.address,
  //                 service: services.services[1]
  //               });

  //               try {
  //                 characteristics = await this.bluetoothLe.characteristics({
  //                   characteristics: [],
  //                   address: data.address,
  //                   service: services[1]
  //                 });
  //               } catch (err) {
  //                 console.log('err', err);
  //                 console.log('characteristics with', {
  //                   characteristics: [],
  //                   address: data.address,
  //                   service: services.services[2]
  //                 });
  //                 characteristics = await this.bluetoothLe.characteristics({
  //                   characteristics: [],
  //                   address: data.address,
  //                   service: services[2]
  //                 });
  //               }
  //             }

  //             console.log('characteristics', characteristics);

  //             console.log('descriptors with', {
  //               characteristic: characteristics[0],
  //               address: data.address,
  //               service: services[0]
  //             });
  //             const descriptors = await this.bluetoothLe.descriptors({
  //               characteristic: characteristics[0],
  //               address: data.address,
  //               service: services[0]
  //             });
  //             console.log('descriptors', descriptors);

  //             try {
  //               console.log('subscribing with', {
  //                 address: data.address,
  //                 service: services[0],
  //                 characteristic: characteristics[0]
  //               });

  //               this.bluetoothLe
  //                 .subscribe({
  //                   address: data.address,
  //                   service: services[0],
  //                   characteristic: characteristics[0]
  //                 })
  //                 .catch(
  //                   (err1, caught1: any): any => {
  //                     console.log('read error 1', err1);
  //                     console.log('caught1', caught1);
  //                   }
  //                 )
  //                 .subscribe(data3 => {
  //                   console.log('data3', data3);
  //                 });
  //             } catch (err) {
  //               console.log('read error', err);
  //             }
  //           });
  //         }
  //       });
  //   } catch (err) {
  //     console.log('err', err);
  //   }

  // await this.bluetoothDeviceConnector.refreshPairedDevices();
  // this.reader = await this.bluetoothDeviceConnector.connectReader();

  // if (this.reader) {
  //   this.bluetoothDeviceConnector.subscribeToReader().subscribe(value => {
  //     console.log('reader value', value);
  //     this.showToast(`reader value ${value}`);
  //   });
  // }
  // }

  public async connectReader() {
    try {
      // const status = await this.barcodeScanner.prepare();
      // console.log('status', status);
      // this.bluetoothDeviceConnector.initialise();

      // const ble = await this.ble.initialize();
      // console.log('ble', ble.status); // logs 'enabled'

      console.log('start scanning');
      this.ble
        .startScan(
          // data => {
          //   console.log('data', data);
          // }
          // err => {
          //   console.log('err', err);
          // }
          []
        )
        .subscribe((device: any) => {
          console.log('data', device);
          console.log('data', device.name);

          if (device.name && device.name.indexOf('SDL') !== -1) {
            //   console.log('found it', data);
            this.ble.connect(device.id).subscribe(async (data2: any) => {
              console.log('data2', data2);

              this.ble.stopScan();

              try {
                console.log(data2.id, data2.services[0], data2.characteristics[0].characteristic);
                this.ble
                  .startNotification(
                    data2.id,
                    // data2.services[0],
                    '2456E1B9-26E2-8F83-E744-F34F01E9D701',
                    // data2.characteristics[0].characteristic
                    '2456E1B9-26E2-8F83-E744-F34F01E9D704'
                  )
                  .catch(
                    (err1, caught1: any): any => {
                      console.log('read error 1', err1);
                      console.log('caught1', caught1);
                    }
                  )
                  .subscribe(data3 => {
                    console.log('data1', data3);
                    console.log('data3', String.fromCharCode.apply(null, new Uint8Array(data3)));
                  });

                this.ble
                  .startNotification(
                    data2.id,
                    // data2.services[0],
                    '2456E1B9-26E2-8F83-E744-F34F01E9D701',
                    // data2.characteristics[0].characteristic
                    '2456E1B9-26E2-8F83-E744-F34F01E9D703'
                  )
                  .catch(
                    (err1, caught1: any): any => {
                      console.log('read error 1', err1);
                      console.log('caught1', caught1);
                    }
                  )
                  .subscribe(data3 => {
                    console.log('data2', data3);
                    console.log('data2', String.fromCharCode.apply(null, new Uint8Array(data3)));
                  });

                try {
                  await this.ble.writeWithoutResponse(
                    data2.id,
                    // data2.services[0],
                    '2456E1B9-26E2-8F83-E744-F34F01E9D701',
                    // data2.characteristics[0].characteristic
                    '2456E1B9-26E2-8F83-E744-F34F01E9D704',
                    this.str2ab('\r')
                  );

                  // await this.ble.writeWithoutResponse(
                  //   data2.id,
                  //   // data2.services[0],
                  //   '2456E1B9-26E2-8F83-E744-F34F01E9D701',
                  //   // data2.characteristics[0].characteristic
                  //   '2456E1B9-26E2-8F83-E744-F34F01E9D704',
                  //   this.str2ab('b2\r')
                  // );

                  // await this.ble.writeWithoutResponse(
                  //   data2.id,
                  //   // data2.services[0],
                  //   '2456E1B9-26E2-8F83-E744-F34F01E9D701',
                  //   // data2.characteristics[0].characteristic
                  //   '2456E1B9-26E2-8F83-E744-F34F01E9D703',
                  //   this.str2ab('\r')
                  // );
                } catch (err) {
                  console.log('err', err);
                }
              } catch (err) {
                console.log('error', err);
              }
            });
          }
        });
    } catch (err) {
      console.log('err', err);
    }
  }

  public str2ab(str) {
    var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }

  public async read1() {
    const data3 = await this.ble.read('AE85AF7A-AE8A-E26A-3C03-6CB2C18B26BD', '180A', '2A29');
    console.log('data3', data3);
    console.log('data3', String.fromCharCode.apply(null, new Uint8Array(data3)));
  }

  public async read2() {
    const data3 = await this.ble.read('AE85AF7A-AE8A-E26A-3C03-6CB2C18B26BD', '180A', '2A24');
    console.log('data4', data3);
    console.log('data4', String.fromCharCode.apply(null, new Uint8Array(data3)));
  }
  public async read3() {
    const data3 = await this.ble.read('AE85AF7A-AE8A-E26A-3C03-6CB2C18B26BD', '180A', '2A26');
    console.log('data5', data3);
    console.log('data5', String.fromCharCode.apply(null, new Uint8Array(data3)));
  }
  public async read4() {
    const data3 = await this.ble.read('AE85AF7A-AE8A-E26A-3C03-6CB2C18B26BD', '180A', '2A28');
    console.log('data6', data3);
    console.log('data6', String.fromCharCode.apply(null, new Uint8Array(data3)));
  }
  public async read5() {
    const data7 = await this.ble.read(
      'AE85AF7A-AE8A-E26A-3C03-6CB2C18B26BD',
      '2456E1B9-26E2-8F83-E744-F34F01E9D701',
      '2456E1B9-26E2-8F83-E744-F34F01E9D704'
    );
    console.log('data7', data7);
    console.log('data7', String.fromCharCode.apply(null, new Uint8Array(data7)));
  }
  public async read6() {
    const data8 = await this.ble.read(
      'AE85AF7A-AE8A-E26A-3C03-6CB2C18B26BD',
      '2456E1B9-26E2-8F83-E744-F34F01E9D701',
      '2456E1B9-26E2-8F83-E744-F34F01E9D703'
    );
    console.log('data8', data8);
    console.log('data8', String.fromCharCode.apply(null, new Uint8Array(data8)));
  }
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

      await this.bluetoothDeviceConnector.disconnect();
      await this.bluetoothDeviceConnector.refreshPairedDevices();

      const connectionResultReader = await this.bluetoothDeviceConnector.checkIfReaderConnected();
      console.log('isconnected Reader', connectionResultReader);

      const connectionResultWeigher = await this.bluetoothDeviceConnector.checkIfWeigherConnected();
      console.log('isconnected Weigher', connectionResultWeigher);

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

      console.log('discover ended');

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
        this.bluetoothDeviceConnector
          .subscribeToReader()
          .filter(v => Boolean(v))
          // .filter(v => v)
          .subscribe(value => {
            console.log('reader value', value);
            this.showToast(`reader value ${value}`);
            this.bluetoothDeviceConnector.readWeight();
          });
      }

      if (this.weigher) {
        this.bluetoothDeviceConnector
          .subscribeToWeigher()
          // .filter(v => v)
          .subscribe(value => {
            console.log('weigher value', value);
            this.showToast(`weigher value ${value}`);

            if (!value) {
              return;
            }

            if (value) {
              // remove carriage return
              value = value.replace(String.fromCharCode(13), '');
            }

            console.log('weigher value 2', value);

            for (let i = 0; i < value.length; i++) {
              console.log(value.charCodeAt(i));
            }

            // if a null, unstable value or 0 value read, read again till we have a real value
            if (value.indexOf('U') > 0 || value === '[0.0]') {
              this.bluetoothDeviceConnector.readWeight();
              return;
            }

            this.message = value;
          });
      }

      // console.log('weigher 2 ', this.weigher);
    } catch (err) {
      this.showError(err.message);
    }
  }

  public async connectUnpairedDevice() {
    await this.bluetoothDeviceConnector.discoverUnpairedDevices();
  }

  public async requestWeight() {
    // await this.bluetoothDeviceConnector.readWeight();
    // this.bluetoothLe.stopScan();
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

  public subscribeToWeigher() {
    this.bluetoothDeviceConnector.subscribeToWeigher().subscribe(value => {
      console.log('weigher value', value);
      this.showToast(`weigher value ${value}`);
    });
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
