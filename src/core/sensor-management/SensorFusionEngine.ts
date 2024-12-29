// src/core/sensor-management/SensorFusionEngine.ts

import { GPSData, IMUData } from './SensorDataProvider';

class SensorFusionEngine {
  
  private lastGPSData: GPSData | null = null;
  private lastIMUData: IMUData | null = null;

  public fuse(gpsData: GPSData, imuData: IMUData): { latitude: number; longitude: number; altitude: number; roll: number; pitch: number; yaw: number } {
    
    this.lastGPSData = gpsData;
    this.lastIMUData = imuData;

    // Simple fusion logic (for demonstration purposes)
    const fusedAltitude = gpsData.altitude; // Use GPS altitude for simplicity
    const fusedRoll = imuData.rollRate; // Use IMU roll rate directly
    const fusedPitch = imuData.pitchRate; // Use IMU pitch rate directly
    const fusedYaw = imuData.yawRate; // Use IMU yaw rate directly

    return {
      latitude: gpsData.latitude,
      longitude: gpsData.longitude,
      altitude: fusedAltitude,
      roll: fusedRoll,
      pitch: fusedPitch,
      yaw: fusedYaw,
    };
  }
}

export default SensorFusionEngine;