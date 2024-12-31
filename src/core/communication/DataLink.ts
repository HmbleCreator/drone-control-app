// src/core/communication/DataLink.ts
import { TelemetryData,DroneCommand } from './TelemetryModels';
import { BleManager, Device, BleError, Characteristic } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { Vector3D } from '@/src/types/sensor';

export class DataLink {
    static getInstance(): DataLink {
        throw new Error('Method not implemented.');
    }
    private connected: boolean = false;
    private listeners: Map<string, Function[]> = new Map();
    private bleManager: BleManager;
    private device: Device | null = null;
    private readonly SERVICE_UUID = '00FF'; // Replace with your drone's BLE service UUID
    private readonly CHARACTERISTIC_UUID = 'FF01'; // Replace with your drone's characteristic UUID

    constructor() {
        this.bleManager = new BleManager();
    }

    public async connect(): Promise<void> {
        try {
            const devices = await new Promise<Device[]>((resolve) => {
                const devices: Device[] = [];
                this.bleManager.startDeviceScan(
                    [this.SERVICE_UUID],
                    { allowDuplicates: false },
                    (error: BleError | null, scannedDevice: Device | null) => {
                        if (error) {
                            console.error('Scan error:', error);
                            resolve(devices);
                            return;
                        }
                        if (scannedDevice?.name?.includes('DRONE')) {
                            devices.push(scannedDevice);
                            if (devices.length === 1) {
                                this.bleManager.stopDeviceScan();
                                resolve(devices);
                            }
                        }
                    }
                );
                
                setTimeout(() => {
                    this.bleManager.stopDeviceScan();
                    resolve(devices);
                }, 5000);
            });

            if (devices.length === 0) {
                throw new Error('No drone found nearby');
            }

            const device = await devices[0].connect();
            await device.discoverAllServicesAndCharacteristics();
            this.device = device;
            this.connected = true;
            this.notifyListeners('connection', true);

            await device.monitorCharacteristicForService(
                this.SERVICE_UUID,
                this.CHARACTERISTIC_UUID,
                (error: BleError | null, characteristic: Characteristic | null) => {
                    if (error) {
                        console.error('Telemetry error:', error);
                        return;
                    }
                    if (characteristic?.value) {
                        const data = this.parseTelemetryData(characteristic.value);
                        this.notifyListeners('telemetry', data);
                    }
                }
            );
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Connection failed: ${errorMessage}`);
        }
    }

    public async disconnect(): Promise<void> {
        if (this.device) {
            await this.device.cancelConnection();
        }
        this.connected = false;
        this.device = null;
        this.notifyListeners('connection', false);
    }

    public async sendCommand(command: DroneCommand): Promise<void> {
        if (!this.connected || !this.device) {
            throw new Error('Not connected');
        }

        const commandBuffer = this.serializeCommand(command);
        
        try {
            await this.device.writeCharacteristicWithResponseForService(
                this.SERVICE_UUID,
                this.CHARACTERISTIC_UUID,
                commandBuffer
            );
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to send command: ${errorMessage}`);
        }
    }

    public onTelemetry(callback: (data: TelemetryData) => void): () => void {
      this.addListener('telemetry', callback);
      return () => this.removeListener('telemetry', callback);
    }

    private parseTelemetryData(value: string): TelemetryData {
      const buffer = Buffer.from(value, 'base64');
        let offset = 0;

        const timestamp = Number(buffer.readBigInt64LE(offset));
        offset += 8;

        // Parse IMU data
        const imu = {
            accelerometer: this.parseVector3D(buffer, offset),
            gyroscope: this.parseVector3D(buffer, offset + 12),
            magnetometer: this.parseVector3D(buffer, offset + 24)
        };
        offset += 36;

        // Parse barometer data
        const barometer = {
            pressure: buffer.readFloatLE(offset),
            temperature: buffer.readFloatLE(offset + 4),
            altitude: buffer.readFloatLE(offset + 8)
        };
        offset += 12;

        // Parse battery data
        const battery = {
            voltage: buffer.readFloatLE(offset),
            current: buffer.readFloatLE(offset + 4),
            percentage: buffer.readFloatLE(offset + 8)
        };
        offset += 12;

        // Parse location data
        const locationData = {
            latitude: buffer.readDoubleLE(offset),
            longitude: buffer.readDoubleLE(offset + 8),
            altitude: buffer.readFloatLE(offset + 16),
            speed: buffer.readFloatLE(offset + 20),
            heading: buffer.readFloatLE(offset + 24),
            accuracy: buffer.readFloatLE(offset + 28),
            satellites: buffer.readUInt8(offset + 32),
            fix: buffer.readUInt8(offset + 33) === 1
        };
        offset += 34;

        // Parse system status
        const systemStatus = {
            armed: buffer.readUInt8(offset) === 1,
            flightMode: this.readString(buffer, offset + 1, 16).trim(),
            errorCodes: this.parseUint16Array(buffer, offset + 17, 8),
            warningFlags: this.parseUint16Array(buffer, offset + 33, 8),
            connectionQuality: buffer.readUInt8(offset + 49)
        };

        return {
            timestamp,
            sensorData: {
                imu,
                barometer,
                battery
            },
            locationData,
            systemStatus
        };
    }

    private parseVector3D(buffer: Buffer, offset: number): Vector3D {
        return {
            x: buffer.readFloatLE(offset),
            y: buffer.readFloatLE(offset + 4),
            z: buffer.readFloatLE(offset + 8)
        };
    }

    private parseUint16Array(buffer: Buffer, offset: number, count: number): number[] {
        const array: number[] = [];
        for (let i = 0; i < count; i++) {
            array.push(buffer.readUInt16LE(offset + i * 2));
        }
        return array;
    }

    private readString(buffer: Buffer, offset: number, length: number): string {
        return buffer.toString('utf8', offset, offset + length);
    }

    private serializeCommand(command: DroneCommand): string {
        const buffer = Buffer.alloc(128); // Adjust size based on your protocol
        let offset = 0;

        // Write command type
        buffer.writeUInt8(this.getCommandTypeCode(command.type), offset++);
        
        // Write timestamp
        buffer.writeBigInt64LE(BigInt(command.timestamp), offset);
        offset += 8;
        
        // Write command ID
        buffer.write(command.id, offset, 36, 'utf8');
        offset += 36;
        
        // Write payload if present
        if (command.payload) {
            if (command.payload.latitude !== undefined) {
                buffer.writeDoubleLE(command.payload.latitude, offset);
            }
            offset += 8;
            
            if (command.payload.longitude !== undefined) {
                buffer.writeDoubleLE(command.payload.longitude, offset);
            }
            offset += 8;
            
            if (command.payload.altitude !== undefined) {
                buffer.writeFloatLE(command.payload.altitude, offset);
            }
            offset += 4;
            
            if (command.payload.speed !== undefined) {
                buffer.writeFloatLE(command.payload.speed, offset);
            }
        }
        
        return buffer.toString('base64');
    }

    private getCommandTypeCode(type: DroneCommand['type']): number {
        const commandCodes = {
            'MOVE': 1,
            'HOVER': 2,
            'LAND': 3,
            'TAKEOFF': 4,
            'RTH': 5,
            'EMERGENCY': 6
        } as const;
        return commandCodes[type];
    }

    private notifyListeners(event: string, data: any): void {
        const eventListeners = this.listeners.get(event) || [];
        eventListeners.forEach(listener => listener(data));
    }

    private addListener(event: string, callback: Function): void {
        const listeners = this.listeners.get(event) || [];
        this.listeners.set(event, [...listeners, callback]);
    }

    private removeListener(event: string, callback: Function): void {
        const listeners = this.listeners.get(event) || [];
        this.listeners.set(event, listeners.filter(l => l !== callback));
    }
}