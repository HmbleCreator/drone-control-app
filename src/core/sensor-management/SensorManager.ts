// src/core/sensor-management/SensorManager.ts

import SensorDataProvider from './SensorDataProvider';
import SensorFusionEngine from './SensorFusionEngine';

class SensorManager {
  
  private dataProvider: SensorDataProvider;
  private fusionEngine: SensorFusionEngine;

  constructor() {
    this.dataProvider = new SensorDataProvider();
    this.fusionEngine = new SensorFusionEngine();
  }

  public async initialize(): Promise<void> {
    console.log("Initializing sensors...");
    // Additional initialization logic can go here
  }

  public async getSensorData(): Promise<{ latitude: number; longitude: number; altitude: number; roll: number; pitch: number; yaw: number }> {
    
    const gpsData = await this.dataProvider.getGPSData();
    const imuData = await this.dataProvider.getIMUData();
    
    const fusedData = this.fusionEngine.fuse(gpsData, imuData);
    
    console.log(`Fused Data - Latitude: ${fusedData.latitude}, Longitude: ${fusedData.longitude}, Altitude: ${fusedData.altitude}, Roll: ${fusedData.roll}, Pitch: ${fusedData.pitch}, Yaw: ${fusedData.yaw}`);
    
    return fusedData;
  }
}

export default SensorManager;