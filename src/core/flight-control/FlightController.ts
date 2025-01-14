import { EmergencyProcedure, EmergencyProcedures } from './EmergencyProcedures';
import { SensorManager } from '../sensor-management/SensorManager';
import MotorController from './MotorController';
import { MissionManager } from '../mission-execution/MissionManager';
import SafetySystem from './SafetySystem';
import ControlAlgorithms from './ControlAlgorithms';
import { 
  TelemetryData, 
  BatteryHealthStatus,
  FlightMode, 
  ArmingState,
} from '../../types/telemetry';
import { Coordinates } from '../../types/mission';

interface TelemetrySubscriber {
  onTelemetryUpdate: (data: TelemetryData) => void;
  onConnectionChange: (connected: boolean) => void;
}

interface FlightSystemConfig {
  updateFrequency: number;
  safetyLimits: {
    maxAltitude: number;
    maxVelocity: number;
    maxAcceleration: number;
    geofenceRadius: number;
  };
  emergencyProcedures: EmergencyProcedures;
  sensors: {
    enabledSensors: Set<string>;
    updateRates: Map<string, number>;
  };
}

class FlightController {
  private sensorManager: SensorManager;
  private motorController: MotorController;
  private missionManager: MissionManager;
  private safetySystem: SafetySystem;
  private updateFrequency: number;
  private telemetryInterval: ReturnType<typeof setInterval> | null = null;
  private subscribers: Set<TelemetrySubscriber> = new Set();
  private isConnected: boolean = false;
  private defaultHomePosition: Coordinates = {
    latitude: 0,
    longitude: 0,
    altitude: 0
  };

  constructor(
    sensorManager: SensorManager,
    motorController: MotorController,
    missionManager: MissionManager,
    safetySystem: SafetySystem
  ) {
    this.sensorManager = sensorManager;
    this.motorController = motorController;
    this.missionManager = missionManager;
    this.safetySystem = safetySystem;
    this.updateFrequency = 100; // Default to 100 ms
  }

  public subscribeTelemetry(subscriber: TelemetrySubscriber) {
    this.subscribers.add(subscriber);
    subscriber.onConnectionChange(this.isConnected);

    if (this.subscribers.size === 1) {
      this.startTelemetryUpdates();
    }

    return {
      unsubscribe: () => {
        this.subscribers.delete(subscriber);
        if (this.subscribers.size === 0) {
          this.stopTelemetryUpdates();
        }
      }
    };
  }

  private async generateTelemetryData(): Promise<TelemetryData> {
    const sensorData = await this.sensorManager.getSensorData();
    
    const missionStatus = this.missionManager.getCurrentStatus();
    
    const currentWaypointIndex = missionStatus?.currentWaypointIndex;
    const currentWaypoint = currentWaypointIndex !== undefined && 
      this.missionManager.currentMission?.waypoints[currentWaypointIndex];
    
    const position = currentWaypoint && 'coordinates' in currentWaypoint
      ? currentWaypoint.coordinates
      : {
          latitude: 0,
          longitude: 0,
          altitude: 0
        };

    const firstWaypoint = this.missionManager.currentMission?.waypoints[0];
    const homePosition = firstWaypoint && 'coordinates' in firstWaypoint
      ? firstWaypoint.coordinates 
      : this.defaultHomePosition;

    const distanceToHome = this.calculateDistance(position, homePosition);

    // Ensure all sensor values have default values if undefined
    const orientation = sensorData.orientation || { roll: 0, pitch: 0, yaw: 0 };
    const altitude = sensorData.altitude ?? 0; // Use nullish coalescing for numeric values
    const groundSpeed = sensorData.groundSpeed ?? 0;
    const verticalSpeed = sensorData.verticalSpeed ?? 0;

    return {
      timestamp: Date.now(),
      sensorData: {
        imu: {
          accelerometer: { x: 0, y: 0, z: 0 },
          gyroscope: { x: 0, y: 0, z: 0 },
          magnetometer: { x: 0, y: 0, z: 0 },
          temperature: 25
        },
        barometer: {
          pressure: 1013.25,
          temperature: 25,
          altitude: altitude
        },
        battery: {
          voltage: 11.8,
          current: 2.5,
          percentage: 85,
          temperature: 25,
          timeRemaining: 900,
          status: BatteryHealthStatus.GOOD
        }
      },
      locationData: {
        latitude: position.latitude,
        longitude: position.longitude,
        altitude: altitude,
        groundSpeed: groundSpeed,
        verticalSpeed: verticalSpeed,
        heading: orientation.yaw,
        accuracy: 2.5,
        satellites: 8,
        fix: true,
        distanceToHome
      },
      attitude: {
        roll: orientation.roll,
        pitch: orientation.pitch,
        yaw: orientation.yaw,
        quaternion: [1, 0, 0, 0]
      },
      systemStatus: {
        armed: false,
        flightMode: FlightMode.MANUAL,
        armingState: ArmingState.DISARMED,
        errorCodes: [],
        warningFlags: [],
        connectionQuality: 95,
        rcSignalStrength: 95,
        dataLinkStatus: {
          connected: true,
          signalStrength: 85,
          latency: 50,
          packetLoss: 0.1
        }
      }
    };
  }

  private startTelemetryUpdates() {
    if (this.telemetryInterval) return;

    this.telemetryInterval = setInterval(async () => {
      try {
        const telemetryData = await this.generateTelemetryData();
        
        this.subscribers.forEach(subscriber => {
          subscriber.onTelemetryUpdate(telemetryData);
        });

        const newConnectionStatus = telemetryData.systemStatus.dataLinkStatus.connected;
        if (this.isConnected !== newConnectionStatus) {
          this.isConnected = newConnectionStatus;
          this.subscribers.forEach(subscriber => {
            subscriber.onConnectionChange(this.isConnected);
          });
        }
      } catch (error) {
        console.error('Error generating telemetry data:', error);
      }
    }, this.updateFrequency);
  }

  private stopTelemetryUpdates() {
    if (this.telemetryInterval) {
      clearInterval(this.telemetryInterval);
      this.telemetryInterval = null;
    }
  }

  private calculateDistance(pos1: Coordinates, pos2: Coordinates): number {
    const R = 6371e3;
    const φ1 = (pos1.latitude * Math.PI) / 180;
    const φ2 = (pos2.latitude * Math.PI) / 180;
    const Δφ = ((pos2.latitude - pos1.latitude) * Math.PI) / 180;
    const Δλ = ((pos2.longitude - pos1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  public cleanup() {
    this.stopTelemetryUpdates();
    this.subscribers.clear();
  }

  public async initialize(config: FlightSystemConfig): Promise<void> {
    try {
      this.updateFrequency = config.updateFrequency;
      console.log("Initializing flight controller with config:", config);

      await this.sensorManager.initialize({
        enabledSensors: config.sensors.enabledSensors,
        updateRates: config.sensors.updateRates,
        fusionAlgorithm: 'KALMAN'
      });

      await this.motorController.validateMotorHealth();
    } catch (error) {
      console.error("Failed to initialize flight controller:", error);
      throw new Error("Flight controller initialization failed");
    }
  }

  public async startFlight(): Promise<void> {
    console.log("Starting flight...");
    await this.motorController.sendControlSignals({ throttle: 100 });
    this.controlLoop();
  }

  public async endFlight(): Promise<void> {
    console.log("Ending flight...");
    await this.motorController.emergencyStop();
  }

  public async executeEmergencyProcedure(procedure: EmergencyProcedure): Promise<void> {
    console.log("Executing emergency procedure:", procedure);
    switch (procedure.type) {
      case 'land':
        await this.motorController.sendControlSignals({ throttle: 0 });
        break;
      case 'return_home':
        console.log("Returning to home position...");
        break;
      case 'hover':
        console.log("Hovering in place...");
        break;
      default:
        console.log('Unknown emergency type.');
        break;
    }
  }

  private async controlLoop(): Promise<void> {
    while (true) {
      const sensorData = await this.sensorManager.getSensorData();
      const currentAltitude = sensorData.altitude ?? 0;

      if (this.safetySystem.checkAltitude(currentAltitude)) {
        const targetAltitude = this.missionManager.getTargetAltitude();
        const throttle = ControlAlgorithms.calculateThrottle(targetAltitude, currentAltitude);
        await this.motorController.sendControlSignals({ throttle });
      } else {
        console.log("Safety limits exceeded. Executing emergency landing.");
        await this.executeEmergencyProcedure({ type: 'land' });
      }

      await new Promise(resolve => setTimeout(resolve, this.updateFrequency));
    }
  }
}

export default FlightController;