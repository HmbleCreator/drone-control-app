// src/core/sensor-management/SensorFusionEngine.ts
import { GPSData, IMUData } from './SensorDataProvider';

export class SensorFusionEngine {
  private lastGPSData: GPSData | null = null;
  private lastIMUData: IMUData | null = null;
  private readonly alpha = 0.8; // Complementary filter coefficient

  public processSensorData(rawData: any) {
    if (rawData.gps) {
      this.lastGPSData = rawData.gps;
    }
    if (rawData.imu) {
      this.lastIMUData = rawData.imu;
    }

    // Only process if we have both GPS and IMU data
    if (this.lastGPSData && this.lastIMUData) {
      return this.fuse(this.lastGPSData, this.lastIMUData);
    }

    return null;
  }

  public fuse(gpsData: GPSData, imuData: IMUData) {
    // Store the new data
    this.lastGPSData = gpsData;
    this.lastIMUData = imuData;

    // Complementary filter for more stable readings
    const fusedData = {
      latitude: gpsData.latitude,
      longitude: gpsData.longitude,
      altitude: gpsData.altitude,
      // Smooth out IMU readings using complementary filter
      roll: this.lastIMUData ? 
        this.alpha * imuData.rollRate + (1 - this.alpha) * this.lastIMUData.rollRate :
        imuData.rollRate,
      pitch: this.lastIMUData ? 
        this.alpha * imuData.pitchRate + (1 - this.alpha) * this.lastIMUData.pitchRate :
        imuData.pitchRate,
      yaw: this.lastIMUData ? 
        this.alpha * imuData.yawRate + (1 - this.alpha) * this.lastIMUData.yawRate :
        imuData.yawRate,
      timestamp: Date.now()
    };

    return fusedData;
  }

  // Method to get the last known good position
  public getLastKnownPosition(): { latitude: number; longitude: number } | null {
    if (this.lastGPSData) {
      return {
        latitude: this.lastGPSData.latitude,
        longitude: this.lastGPSData.longitude
      };
    }
    return null;
  }

  // Method to get the last known orientation
  public getLastKnownOrientation(): { roll: number; pitch: number; yaw: number } | null {
    if (this.lastIMUData) {
      return {
        roll: this.lastIMUData.rollRate,
        pitch: this.lastIMUData.pitchRate,
        yaw: this.lastIMUData.yawRate
      };
    }
    return null;
  }
}
