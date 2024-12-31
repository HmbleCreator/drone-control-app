// src/core/communication/TelemetryModels.ts
export interface TelemetryData {
  timestamp: number;
  sensorData: SensorTelemetry;
  locationData: LocationTelemetry;
  systemStatus: SystemTelemetry;
}

export interface SensorTelemetry {
  imu: {
      accelerometer: Vector3D;
      gyroscope: Vector3D;
      magnetometer: Vector3D;
  };
  barometer: {
      pressure: number;
      temperature: number;
      altitude: number;
  };
  battery: {
      voltage: number;
      current: number;
      percentage: number;
  };
}

export interface LocationTelemetry {
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  heading: number;
  accuracy: number;
  satellites: number;
  fix: boolean;
}

export interface SystemTelemetry {
  armed: boolean;
  flightMode: string;
  errorCodes: number[];
  warningFlags: number[];
  connectionQuality: number;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface DroneCommand {
  type: 'MOVE' | 'HOVER' | 'LAND' | 'TAKEOFF' | 'RTH' | 'EMERGENCY';
  payload?: {
      latitude?: number;
      longitude?: number;
      altitude?: number;
      speed?: number;
  } | null;
  timestamp: number;
  id: string;
}