import { Injectable } from '@angular/core';
// import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Platform } from 'ionic-angular';
import { uniqBy } from 'lodash';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class BluetoothDeviceConnectorService {
  private readonly CARRIAGE_DATA: string = '{ZC1}';
  private readonly ANDROID_INTERFACE_ID: string = '00001101-0000-1000-8000-00805F9B34FB';
  public weigherConfig: BluetoothPluginConnectionConfig;
  private bluetoothSerial;
  private devices: DeviceConfig[];
  private readonly Readers: Set<string> = new Set(['rs320', 'RS420', 'xrs2']);
  private readonly Weighers: Set<string> = new Set(['EziWeigh', 'XR5000']);

  constructor(
    // private androidPermissions: AndroidPermissions,
    private platform: Platform
  ) {}

  /**
   * Initialise plugin
   */
  public initialise(): void {
    if (!this.bluetoothSerial) {
      this.bluetoothSerial = (<any>window).bluetoothClassicSerial;
    }
  }

  /**
   * Requests current weight from the weigher. The weight would be published to the behavior subject from the connectWeigher function
   */
  public async readWeight(): Promise<void> {
    await this.writeToWeigher(this.CARRIAGE_DATA); // enable carriage \n
    await this.writeToWeigher('{RW}'); // Tru-Test - yes  gallagher?   this is a live weight
  }

  /**
   * Requests a stable weight from the weigher. The weight would be published to the behavior subject from the connectWeigher function
   */
  public async readStableWeight(): Promise<void> {
    await this.writeToWeigher(this.CARRIAGE_DATA); // enable carriage \n
    await this.writeToWeigher('{RO}'); // Tru-Test - yes  gallagher?   this is a live weight
  }

  /**
   * Connect to a bluetooth reader
   *
   * return true if connection was successful
   */
  public connectReader(): Promise<string> {
    const reader = this.devices.find(d => this.Readers.has(d.name));

    console.log('connectReader', reader);

    if (reader) {
      return this.connect(reader);
    } else {
      return Promise.resolve('');
    }
  }

  /**
   * Connect to a bluetooth weigher
   *
   * return the name weigher if connection was successful
   */
  public connectWeigher(): Promise<string> {
    const weigher = this.devices.find(d => this.Weighers.has(d.name));

    console.log('connectWeigher', weigher);

    if (weigher) {
      this.weigherConfig = this.buildPlatformSpecificConfig(weigher);
      return this.connect(weigher);
    } else {
      return Promise.resolve('');
    }
  }

  /**
   * Subscribe to bluetooth reader values
   *
   * return a behavior subject with the values from the reader
   */
  public subscribeToReader(): BehaviorSubject<string> {
    const reader = this.devices.find(d => this.Readers.has(d.name));

    return this.subscribeToDevice(reader);
  }

  /**
   * Subscribe to bluetooth weigher values
   *
   * return a behavior subject with the values from the weigher
   */
  public subscribeToWeigher(): BehaviorSubject<string> {
    const weigher = this.devices.find(d => this.Weighers.has(d.name));

    return this.subscribeToDevice(weigher);
  }

  private connect(config: DeviceConfig): Promise<string> {
    const platformSpecificConfig = this.buildPlatformSpecificConfig(config);
    return new Promise((resolve, reject) => {
      this.bluetoothSerial.connect(
        platformSpecificConfig.deviceId,
        platformSpecificConfig.interfaceIdArray,
        () => {
          resolve(config.name);
        },
        error => {
          console.log('error', error);
          resolve(null);
        }
      );
    });
  }

  /**
   * Function to detect whether a reader is connected or not
   * Returns a boolean
   */
  public checkIfReaderConnected(): Promise<boolean> {
    const reader = this.devices.find(d => this.Readers.has(d.name));
    if (!reader) {
      return Promise.resolve(false);
    }
    const platformSpecificConfig = this.buildPlatformSpecificConfig(reader);
    return new Promise((resolve, reject) => {
      this.bluetoothSerial.isConnected(
        platformSpecificConfig.deviceId,
        platformSpecificConfig.interfaceIdArray,
        () => {
          resolve(true);
        },
        error => {
          console.log('error', error);
          resolve(false);
        }
      );
    });
  }


   /**
   * Function to detect whether a reader is connected or not
   * Returns a boolean
   */
  public checkIfWeigherConnected(): Promise<boolean> {
    const weigher = this.devices.find(d => this.Weighers.has(d.name));
    if (!weigher) {
      return Promise.resolve(false);
    }
    const platformSpecificConfig = this.buildPlatformSpecificConfig(weigher);
    return new Promise((resolve, reject) => {
      this.bluetoothSerial.isConnected(
        platformSpecificConfig.deviceId,
        platformSpecificConfig.interfaceIdArray,
        () => {
          resolve(true);
        },
        error => {
          console.log('error', error);
          resolve(false);
        }
      );
    });
  }


  // /**
  //  * Check if app has bluetooth permission
  //  * If not, then request user for permission
  //  */
  // public async checkAndRequestBluetoothPermission(): Promise<boolean> {
  //   try {
  //     const result = await this.androidPermissions.checkPermission(
  //       this.androidPermissions.PERMISSION.BLUETOOTH
  //     );
  //     console.log('Has permission?', result.hasPermission);
  //   } catch (err) {
  //     await this.androidPermissions.requestPermissions([
  //       this.androidPermissions.PERMISSION.BLUETOOTH,
  //       this.androidPermissions.PERMISSION.BLUETOOTH_ADMIN,
  //       this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION
  //     ]);

  //     const result = await this.androidPermissions.checkPermission(
  //       this.androidPermissions.PERMISSION.BLUETOOTH
  //     );
  //     return result.hasPermission;
  //   }
  // }

  /**
   * Return whether bluetooth is switched on the device
   */
  public checkBluetoothEnabled(): Promise<boolean> {
    return new Promise(res => {
      this.bluetoothSerial.isEnabled(
        () => {
          res(true);
        },
        () => {
          res(false);
        }
      );
    });
  }

  public async refreshPairedDevices(): Promise<void> {
    console.log('listing bluetooth devices');

    this.devices = await new Promise<DeviceConfig[]>((resolve, reject) => {
      this.bluetoothSerial.list(
        pairedDevices => {
          for (let device of pairedDevices) {
            console.log('device', device);
          }

          resolve(pairedDevices);
        },
        error => {
          reject(error);
        }
      );
    });
  }

  /**
   * Find unpaired devices and adds them to the devices list
   *
   * Android
   *
   * The discovery process takes a while to happen.
   * You may want to show a progress indicator while waiting for the discover process to finish.
   * Once finished, would add the list unpaired devices to the devices list
   *
   * iOS
   *
   * Will launch a native iOS window showing all devices which match the protocol string defined in the application's cordova config.xml file.
   * Choosing a device from the list will initiate pairing. Once paired the device is available for connection.
   * This newly paired device will be added to the devices list
   */
  public async discoverUnpairedDevices(): Promise<void> {
    let unpairedDevices;
    if (this.platform.is('android')) {
      unpairedDevices = await this.discoverUnpairedDevicesForAndroid();
    } else if (this.platform.is('ios')) {
      unpairedDevices = await this.discoverUnpairedDevicesForIos();
    } else {
      throw new Error('Only supported on android and iOS');
    }

    this.devices = uniqBy(this.devices.concat(unpairedDevices), 'id');
  }

  public disconnect() {
    return new Promise((resolve, reject) => {
      this.bluetoothSerial.disconnect(resolve, reject);
    });
  }

  private discoverUnpairedDevicesForAndroid(): Promise<DeviceConfig[]> {
    return new Promise((resolve, reject) => {
      this.bluetoothSerial.discoverUnpaired(
        pairedDevices => {
          for (let device of pairedDevices) {
            console.log('discoverUnpaired device', device);
          }

          resolve(pairedDevices);
        },
        error => {
          console.log('error listing bluetooth devices', error);
          reject(error);
        }
      );
    });
  }

  private discoverUnpairedDevicesForIos(): Promise<DeviceConfig[]> {
    this.bluetoothSerial.discoverUnpaired();

    return new Promise(resolve => {
      this.bluetoothSerial.setDeviceDiscoveredListener((device: DeviceConfig) => {
        resolve([device]);
      });
    });
  }

  // https://github.com/soltius/BluetoothClassicSerial#connect
  private buildPlatformSpecificConfig(config: DeviceConfig): BluetoothPluginConnectionConfig {
    if (this.platform.is('android')) {
      return {
        deviceId: config.address,
        interfaceIdArray: [this.ANDROID_INTERFACE_ID]
      };
    } else if (this.platform.is('ios')) {
      return {
        deviceId: config.id,
        interfaceIdArray: config.protocols.filter(p => p !== '')
      };
    } else {
      alert('not supported');
      return;
    }
  }

  /* Subscribe to the device to receive data */
  private subscribeToDevice(config: DeviceConfig): BehaviorSubject<string> {
    const platformSpecificConfig = this.buildPlatformSpecificConfig(config);
    const subject = new BehaviorSubject(null);

    // Subscribe to data receiving as soon as the delimiter is read
    this.bluetoothSerial.subscribe(
      platformSpecificConfig.interfaceIdArray[0],
      '\r',
      data => {
        console.log('data', data);
        subject.next(data);
      },
      error => {
        console.error(`Error during receiving data from ${config.name}`, error);
      }
    );

    return subject;
  }

  private writeToWeigher(data): Promise<void> {
    let osSpecificInterfaceId;
    if (this.platform.is('android')) {
      osSpecificInterfaceId = this.ANDROID_INTERFACE_ID;
    } else if (this.platform.is('ios')) {
      osSpecificInterfaceId = this.weigherConfig.interfaceIdArray[0];
    } else {
      alert('not supported');
      return;
    }

    return new Promise((resolve, reject) => {
      this.bluetoothSerial.write(
        osSpecificInterfaceId,
        data,
        () => {
          resolve();
        },
        error => {
          reject(error);
        }
      );
    });
  }
}

export interface DeviceConfig {
  address: string;
  name: string;
  id: string;
  protocols?: string[];
  class?: number;
}

export interface BluetoothPluginConnectionConfig {
  deviceId: string;
  interfaceIdArray: string[];
}
