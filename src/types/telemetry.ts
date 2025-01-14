import { Vector3D } from './common';

export enum BatteryHealthStatus {
  GOOD = 'GOOD',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  UNKNOWN = 'UNKNOWN'
}

export enum FlightMode {
  MANUAL = 'MANUAL',
  ASSISTED = 'ASSISTED',
  AUTO = 'AUTO',
  RETURN_TO_HOME = 'RETURN_TO_HOME',
  EMERGENCY = 'EMERGENCY'
}

export enum ArmingState {
  DISARMED = 'DISARMED',
  ARMING = 'ARMING',
  ARMED = 'ARMED',
  DISARMING = 'DISARMING'
}

export interface TelemetryMetric {
  key: string;
  label: string;
  path: string[];
  color: string;
  unit: string;
  description?: string;
}

export interface TelemetryData {
  timestamp: number;
  sensorData: {
    imu: {
      accelerometer: Vector3D;
      gyroscope: Vector3D;
      magnetometer: Vector3D;
      temperature: number;
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
      temperature: number;
      timeRemaining: number;
      status: BatteryHealthStatus;
    };
  };
  locationData: {
    latitude: number;
    longitude: number;
    altitude: number;
    groundSpeed: number;
    verticalSpeed: number;
    heading: number;
    accuracy: number;
    satellites: number;
    fix: boolean;
    distanceToHome: number;
  };
  attitude: {
    roll: number;
    pitch: number;
    yaw: number;
    quaternion: [number, number, number, number];
  };
  systemStatus: {
    armed: boolean;
    flightMode: FlightMode;
    armingState: ArmingState;
    errorCodes: number[];
    warningFlags: number[];
    connectionQuality: number;
    rcSignalStrength: number;
    dataLinkStatus: {
      connected: boolean;
      signalStrength: number;
      latency: number;
      packetLoss: number;
    };
  };
}