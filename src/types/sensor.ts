
// sensor.ts
export interface SensorData {
    imu: IMUData;
    gps: GPSData;
    barometer: BarometerData;
    compass: CompassData;
    rangefinder?: RangefinderData;
    opticalFlow?: OpticalFlowData;
  }
  
  export interface IMUData {
    accelerometer: Vector3D;
    gyroscope: Vector3D;
    magnetometer?: Vector3D;
    temperature: number;
    timestamp: number;
  }
  
  export interface Vector3D {
    x: number;
    y: number;
    z: number;
  }
  
  export interface GPSData {
    latitude: number;
    longitude: number;
    altitude: number;
    speed: number;
    course: number;
    accuracy: {
      horizontal: number;
      vertical: number;
    };
    satellites: number;
    timestamp: number;
  }
  
  export interface BarometerData {
    pressure: number;      // hPa
    altitude: number;      // meters
    temperature: number;   // celsius
    timestamp: number;
  }
  
  export interface CompassData {
    heading: number;       // degrees
    declination: number;   // degrees
    calibrationStatus: CompassCalibrationStatus;
    timestamp: number;
  }
  
  export enum CompassCalibrationStatus {
    UNCALIBRATED = 'UNCALIBRATED',
    IN_PROGRESS = 'IN_PROGRESS',
    CALIBRATED = 'CALIBRATED',
    FAILED = 'FAILED'
  }
  
  export interface RangefinderData {
    distance: number;      // meters
    minRange: number;      // meters
    maxRange: number;      // meters
    quality: number;       // 0-255
    timestamp: number;
  }
  
  export interface OpticalFlowData {
    flowX: number;         // pixels
    flowY: number;         // pixels
    quality: number;       // 0-255
    groundDistance: number;// meters
    timestamp: number;
  }
  
  // Common types used across modules
  export interface DroneCommand {
    id: string;
    type: CommandType;
    parameters: Record<string, any>;
    timestamp: number;
    priority: CommandPriority;
    source: CommandSource;
  }
  
  export enum CommandType {
    ARM = 'ARM',
    DISARM = 'DISARM',
    TAKEOFF = 'TAKEOFF',
    LAND = 'LAND',
    MOVE = 'MOVE',
    HOVER = 'HOVER',
    RETURN_HOME = 'RETURN_HOME',
    EMERGENCY_STOP = 'EMERGENCY_STOP'
  }
  
  export enum CommandPriority {
    LOW = 'LOW',
    NORMAL = 'NORMAL',
    HIGH = 'HIGH',
    EMERGENCY = 'EMERGENCY'
  }
  
  export enum CommandSource {
    USER = 'USER',
    MISSION = 'MISSION',
    SAFETY_SYSTEM = 'SAFETY_SYSTEM',
    AUTONOMOUS = 'AUTONOMOUS'
  }