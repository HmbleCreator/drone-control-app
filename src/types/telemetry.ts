// types/telemetry.ts
import { Coordinates } from "./mission";
import { SensorData } from "./sensor";

export interface TelemetryData {
  verticalSpeed: number;
  groundSpeed: number;
  distanceToHome: number;
  timestamp: number;
  position: Coordinates;
  attitude: DroneAttitude;
  velocity: DroneVelocity;
  battery: BatteryStatus;
  systemStatus: SystemStatus;
  sensorReadings: SensorData;
}

export interface DroneAttitude {
  roll: number;    // degrees
  pitch: number;   // degrees
  yaw: number;     // degrees
  quaternion: [number, number, number, number];
}

export interface DroneVelocity {
  x: number;  // m/s
  y: number;  // m/s
  z: number;  // m/s
  groundSpeed: number;  // m/s
}

export interface BatteryStatus {
  percentage: number;
  voltage: number;
  current: number;
  temperature: number;
  timeRemaining: number;  // seconds
  status: BatteryHealthStatus;
}

export enum BatteryHealthStatus {
  GOOD = 'GOOD',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  UNKNOWN = 'UNKNOWN'
}

export interface SystemStatus {
  flightMode: FlightMode;
  armingState: ArmingState;
  errorCodes: number[];
  warningFlags: number;
  gpsStatus: GPSStatus;
  rcSignalStrength: number;
  dataLinkStatus: DataLinkStatus;
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

export interface GPSStatus {
  fix: boolean;
  numSatellites: number;
  hdop: number;
  accuracy: number;
}

export interface DataLinkStatus {
  connected: boolean;
  signalStrength: number;
  latency: number;
  packetLoss: number;
}