import { 
  TelemetryData,} from './TelemetryModels';
import { DataLink } from './DataLink';
import { 
  NotificationService, 
  NotificationPriority, 
  NotificationConfig 
} from '../notifications/NotificationService';

interface TelemetryStreamConfig {
  bufferSize?: number;
  notificationCooldown?: number;
  criticalBatteryThreshold?: number;
  lowBatteryThreshold?: number;
  minSatellites?: number;
  maxAltitude?: number;
  minConnectionQuality?: number;
}

enum SystemErrorCode {
  MOTOR_FAILURE = 1,
  ESC_ERROR = 2,
  SENSOR_MALFUNCTION = 3,
  CALIBRATION_REQUIRED = 4,
  COMMUNICATION_ERROR = 5
}

export class TelemetryStream {
  private dataLink: DataLink;
  private telemetryBuffer: TelemetryData[] = [];
  private readonly bufferSize: number;
  private isRecording: boolean = false;
  private telemetryInterval: NodeJS.Timeout | null = null;
  private notificationService: NotificationService;
  private lastNotificationTimes: Map<string, number> = new Map();
  private readonly NOTIFICATION_COOLDOWN: number;
  private readonly CRITICAL_BATTERY_THRESHOLD: number;
  private readonly LOW_BATTERY_THRESHOLD: number;
  private readonly MIN_SATELLITES: number;
  private readonly MAX_ALTITUDE: number;
  private readonly MIN_CONNECTION_QUALITY: number;

  constructor(dataLink: DataLink, config?: TelemetryStreamConfig) {
      this.dataLink = dataLink;
      this.notificationService = NotificationService.getInstance();
      
      // Initialize configuration
      this.bufferSize = config?.bufferSize ?? 100;
      this.NOTIFICATION_COOLDOWN = config?.notificationCooldown ?? 10000;
      this.CRITICAL_BATTERY_THRESHOLD = config?.criticalBatteryThreshold ?? 5;
      this.LOW_BATTERY_THRESHOLD = config?.lowBatteryThreshold ?? 20;
      this.MIN_SATELLITES = config?.minSatellites ?? 6;
      this.MAX_ALTITUDE = config?.maxAltitude ?? 120;
      this.MIN_CONNECTION_QUALITY = config?.minConnectionQuality ?? 50;

      this.initializeTelemetryStream();
  }

  public subscribe(callback: (data: TelemetryData) => void): () => void {
      return this.dataLink.onTelemetry((data: TelemetryData) => {
          this.bufferTelemetry(data);
          callback(data);
      });
  }

  public startRecording(): void {
      this.isRecording = true;
  }

  public stopRecording(): void {
      this.isRecording = false;
  }

  public clearBuffer(): void {
      this.telemetryBuffer = [];
  }

  private bufferTelemetry(data: TelemetryData): void {
      if (this.isRecording) {
          this.telemetryBuffer.push(data);
          if (this.telemetryBuffer.length > this.bufferSize) {
              this.telemetryBuffer.shift();
          }
      }
  }

  private initializeTelemetryStream(): void {
      this.telemetryInterval = setInterval(() => {
          if (this.telemetryBuffer.length > 0) {
              const latestData = this.telemetryBuffer[this.telemetryBuffer.length - 1];
              this.checkTelemetryHealth(latestData).catch(error => {
                  console.error('Error checking telemetry health:', error);
              });
          }
      }, 1000);
  }

  private async checkTelemetryHealth(data: TelemetryData): Promise<void> {
      const now = Date.now();

      // Check battery with progressive warnings
      if (data.sensorData.battery.percentage <= this.CRITICAL_BATTERY_THRESHOLD) {
          await this.throttledNotification('battery_critical', now, async () => {
              await this.notifyLowBattery(data.sensorData.battery.percentage, true);
          });
      } else if (data.sensorData.battery.percentage < this.LOW_BATTERY_THRESHOLD) {
          await this.throttledNotification('battery_low', now, async () => {
              await this.notifyLowBattery(data.sensorData.battery.percentage, false);
          });
      }

      // Check GPS
      if (!data.locationData.fix || data.locationData.satellites < this.MIN_SATELLITES) {
          await this.throttledNotification('gps', now, async () => {
              await this.notifyPoorGPS(data.locationData.satellites);
          });
      }

      // Check altitude
      if (data.locationData.altitude > this.MAX_ALTITUDE) {
          await this.throttledNotification('altitude', now, async () => {
              await this.notifyAltitudeWarning(data.locationData.altitude);
          });
      }

      // Check system errors immediately without throttling
      if (data.systemStatus.errorCodes.length > 0) {
          await this.notifySystemErrors(data.systemStatus.errorCodes);
      }

      // Check connection quality
      if (data.systemStatus.connectionQuality < this.MIN_CONNECTION_QUALITY) {
          await this.throttledNotification('connection', now, async () => {
              await this.notifyPoorConnection(data.systemStatus.connectionQuality);
          });
      }
  }

  private async throttledNotification(
      key: string,
      now: number,
      notifyFn: () => Promise<void>
  ): Promise<void> {
      try {
          const lastTime = this.lastNotificationTimes.get(key) || 0;
          if (now - lastTime >= this.NOTIFICATION_COOLDOWN) {
              await notifyFn();
              this.lastNotificationTimes.set(key, now);
          }
      } catch (error) {
          console.error(`Error in throttled notification for ${key}:`, error);
      }
  }

  private async notifyLowBattery(level: number, isCritical: boolean): Promise<void> {
      const notification: NotificationConfig = {
          title: isCritical ? 'CRITICAL: Battery Critical' : 'Warning: Low Battery',
          message: isCritical 
              ? `EMERGENCY: Battery at ${level}%. Initiating emergency landing!` 
              : `Battery at ${level}%. Please land soon.`,
          priority: isCritical ? NotificationPriority.CRITICAL : NotificationPriority.HIGH,
          vibrate: true
      };
      
      await this.notificationService.notify(notification);
  }

  private async notifyPoorGPS(satellites: number): Promise<void> {
      const notification: NotificationConfig = {
          title: 'GPS Signal Warning',
          message: `Poor GPS signal: ${satellites} satellites. Position accuracy may be affected.`,
          priority: NotificationPriority.MEDIUM
      };
      
      await this.notificationService.notify(notification);
  }

  private async notifyAltitudeWarning(altitude: number): Promise<void> {
      const notification: NotificationConfig = {
          title: 'Altitude Warning',
          message: `Drone altitude ${altitude}m exceeds safe limits. Please decrease altitude.`,
          priority: NotificationPriority.HIGH,
          vibrate: true
      };
      
      await this.notificationService.notify(notification);
  }

  private async notifySystemErrors(errorCodes: number[]): Promise<void> {
      const errorMessages = this.getErrorMessages(errorCodes);
      const notification: NotificationConfig = {
          title: 'System Errors Detected',
          message: `Critical system errors: ${errorMessages.join(', ')}`,
          priority: NotificationPriority.CRITICAL,
          vibrate: true
      };
      
      await this.notificationService.notify(notification);
  }

  private async notifyPoorConnection(quality: number): Promise<void> {
      const notification: NotificationConfig = {
          title: 'Connection Warning',
          message: `Poor connection quality (${quality}%). Control responsiveness may be affected.`,
          priority: NotificationPriority.MEDIUM
      };
      
      await this.notificationService.notify(notification);
  }

  private getErrorMessages(errorCodes: number[]): string[] {
      const errorMap: Record<SystemErrorCode, string> = {
          [SystemErrorCode.MOTOR_FAILURE]: 'Motor failure',
          [SystemErrorCode.ESC_ERROR]: 'ESC error',
          [SystemErrorCode.SENSOR_MALFUNCTION]: 'Sensor malfunction',
          [SystemErrorCode.CALIBRATION_REQUIRED]: 'Calibration required',
          [SystemErrorCode.COMMUNICATION_ERROR]: 'Communication error'
      };
      return errorCodes.map(code => 
          code in errorMap ? errorMap[code as SystemErrorCode] : `Unknown error (${code})`
      );
  }

  public getTelemetryHistory(): TelemetryData[] {
      return [...this.telemetryBuffer];
  }

  public cleanup(): void {
      if (this.telemetryInterval) {
          clearInterval(this.telemetryInterval);
          this.telemetryInterval = null;
      }
      this.lastNotificationTimes.clear();
      this.clearBuffer();
  }
}