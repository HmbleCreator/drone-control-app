// src/core/flight-control/DroneState.ts
export interface DroneState {
    position: {
      latitude: number;
      longitude: number;
      altitude: number;
      accuracy: number;
    };
    attitude: {
      roll: number;
      pitch: number;
      yaw: number;
      quaternion: [number, number, number, number];
    };
    velocity: {
      x: number;
      y: number;
      z: number;
      groundSpeed: number;
    };
    systemStatus: {
      armed: boolean;
      flightMode: string;
      gpsLock: boolean;
      batteryVoltage: number;
      batteryPercentage: number;
    };
  }