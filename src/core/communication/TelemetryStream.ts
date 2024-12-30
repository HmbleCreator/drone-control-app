
// src/core/communication/TelemetryStream.ts
import { TelemetryModels } from './TelemetryModels';
import { DataLink } from './DataLink';
import { NotificationService, NotificationPriority } from '../notifications/NotificationService';

export class TelemetryStream {
    private dataLink: DataLink;
    private telemetryBuffer: TelemetryModels[] = [];
    private readonly bufferSize: number = 100;
    private isRecording: boolean = false;
    private telemetryInterval: NodeJS.Timeout | null = null;
    private notificationService: NotificationService;
    private lastNotificationTimes: Map<string, number> = new Map();
    private readonly NOTIFICATION_COOLDOWN = 10000; // 10 seconds

    constructor(dataLink: DataLink) {
        this.dataLink = dataLink;
        this.notificationService = NotificationService.getInstance();
        this.initializeTelemetryStream();
    }

    public subscribe(callback: (data: TelemetryModels) => void): () => void {
        return this.dataLink.onTelemetry((data) => {
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

    private bufferTelemetry(data: TelemetryModels): void {
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
                this.checkTelemetryHealth(latestData);
            }
        }, 1000);
    }

    private async checkTelemetryHealth(data: TelemetryModels): Promise<void> {
        const now = Date.now();

        // Check battery with progressive warnings
        if (data.sensorData.battery.percentage <= 5) {
            await this.throttledNotification('battery_critical', now, async () => {
                await this.notifyLowBattery(data.sensorData.battery.percentage, true);
            });
        } else if (data.sensorData.battery.percentage < 20) {
            await this.throttledNotification('battery_low', now, async () => {
                await this.notifyLowBattery(data.sensorData.battery.percentage, false);
            });
        }

        // Check GPS
        if (!data.locationData.fix || data.locationData.satellites < 6) {
            await this.throttledNotification('gps', now, async () => {
                await this.notifyPoorGPS(data.locationData.satellites);
            });
        }

        // Check altitude
        if (data.locationData.altitude > 120) {
            await this.throttledNotification('altitude', now, async () => {
                await this.notifyAltitudeWarning(data.locationData.altitude);
            });
        }

        // Check system errors immediately without throttling
        if (data.systemStatus.errorCodes.length > 0) {
            await this.notifySystemErrors(data.systemStatus.errorCodes);
        }

        // Check connection quality
        if (data.systemStatus.connectionQuality < 50) {
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
        const lastTime = this.lastNotificationTimes.get(key) || 0;
        if (now - lastTime >= this.NOTIFICATION_COOLDOWN) {
            await notifyFn();
            this.lastNotificationTimes.set(key, now);
        }
    }

    private async notifyLowBattery(level: number, isCritical: boolean): Promise<void> {
        await this.notificationService.notify({
            title: isCritical ? 'CRITICAL: Battery Critical' : 'Warning: Low Battery',
            message: isCritical 
                ? `EMERGENCY: Battery at ${level}%. Initiating emergency landing!` 
                : `Battery at ${level}%. Please land soon.`,
            priority: isCritical ? NotificationPriority.CRITICAL : NotificationPriority.HIGH,
            vibrate: true,
            persistent: isCritical
        });
    }

    private async notifyPoorGPS(satellites: number): Promise<void> {
        await this.notificationService.notify({
            title: 'GPS Signal Warning',
            message: `Poor GPS signal: ${satellites} satellites. Position accuracy may be affected.`,
            priority: NotificationPriority.MEDIUM
        });
    }

    private async notifyAltitudeWarning(altitude: number): Promise<void> {
        await this.notificationService.notify({
            title: 'Altitude Warning',
            message: `Drone altitude ${altitude}m exceeds safe limits. Please decrease altitude.`,
            priority: NotificationPriority.HIGH,
            vibrate: true
        });
    }

    private async notifySystemErrors(errorCodes: number[]): Promise<void> {
        const errorMessages = this.getErrorMessages(errorCodes);
        await this.notificationService.notify({
            title: 'System Errors Detected',
            message: `Critical system errors: ${errorMessages.join(', ')}`,
            priority: NotificationPriority.CRITICAL,
            vibrate: true,
            persistent: true
        });
    }

    private async notifyPoorConnection(quality: number): Promise<void> {
        await this.notificationService.notify({
            title: 'Connection Warning',
            message: `Poor connection quality (${quality}%). Control responsiveness may be affected.`,
            priority: NotificationPriority.MEDIUM
        });
    }

    private getErrorMessages(errorCodes: number[]): string[] {
        const errorMap: { [key: number]: string } = {
            1: 'Motor failure',
            2: 'ESC error',
            3: 'Sensor malfunction',
            4: 'Calibration required',
            5: 'Communication error'
            // Add more error codes as needed
        };
        return errorCodes.map(code => errorMap[code] || `Unknown error (${code})`);
    }

    public getTelemetryHistory(): TelemetryModels[] {
        return [...this.telemetryBuffer];
    }

    public cleanup(): void {
        if (this.telemetryInterval) {
            clearInterval(this.telemetryInterval);
            this.telemetryInterval = null;
        }
    }
}