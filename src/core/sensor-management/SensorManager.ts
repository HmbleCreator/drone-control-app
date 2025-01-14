
// src/core/sensor-management/SensorManager.ts
import  SensorDataProvider  from './SensorDataProvider';
import { SensorFusionEngine } from './SensorFusionEngine';

interface SensorManagerConfig {
  enabledSensors: Set<string>;
  updateRates: Map<string, number>;
  fusionAlgorithm: 'KALMAN' | 'COMPLEMENTARY';  // Added this to match the config
}

type SensorCallback = (data: any) => void;

export class SensorManager {
  private dataProvider: SensorDataProvider;
  private fusionEngine: SensorFusionEngine;
  private subscribers: Set<SensorCallback>;

  constructor() {
    this.dataProvider = new SensorDataProvider();
    this.fusionEngine = new SensorFusionEngine();
    this.subscribers = new Set();
  }

  public async initialize(config: SensorManagerConfig): Promise<void> {
    console.log("Initializing sensors with config:", config);
    // Initialization logic here
  }

  public async calibrateSensors(): Promise<void> {
    // Implement calibration logic
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  public subscribe(callback: SensorCallback) {
    this.subscribers.add(callback);
    return {
      unsubscribe: () => {
        this.subscribers.delete(callback);
      }
    };
  }

  public cleanup(): void {
    this.subscribers.clear();
  }

  public async getSensorData(): Promise<any> {
    const gpsData = await this.dataProvider.getGPSData();
    const imuData = await this.dataProvider.getIMUData();
    return this.fusionEngine.fuse(gpsData, imuData);
  }
}