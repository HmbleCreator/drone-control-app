// src/core/flight-control/PositionEstimator.ts
import { LocationTelemetry } from '../communication/TelemetryModels';

interface PositionSubscriber {
    onLocation: (location: LocationTelemetry) => void;
    onError: (error: Error) => void;
}

export class PositionEstimator {
    private latitude: number = 0;
    private longitude: number = 0;
    private subscribers: PositionSubscriber[] = [];
    private updateInterval: ReturnType<typeof setInterval> | null = null;  // Changed this line

    public async initialize(): Promise<void> {
        // Simulate initialization
        return Promise.resolve();
    }

    public update(gpsData: { latitude: number; longitude: number }): void {
        this.latitude = gpsData.latitude;
        this.longitude = gpsData.longitude;

        // Notify subscribers
        this.notifySubscribers();
    }

    public getPosition(): { latitude: number; longitude: number } {
        return { latitude: this.latitude, longitude: this.longitude };
    }

    public subscribe(subscriber: PositionSubscriber): { unsubscribe: () => void } {
        this.subscribers.push(subscriber);

        // Start periodic updates if this is the first subscriber
        if (this.subscribers.length === 1) {
            this.startUpdates();
        }

        return {
            unsubscribe: () => {
                this.subscribers = this.subscribers.filter(s => s !== subscriber);
                if (this.subscribers.length === 0) {
                    this.stopUpdates();
                }
            }
        };
    }

    public cleanup(): void {
        this.stopUpdates();
        this.subscribers = [];
    }

    private startUpdates(): void {
        this.updateInterval = setInterval(() => {
            this.notifySubscribers();
        }, 1000); // Update every second
    }

    private stopUpdates(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    private notifySubscribers(): void {
        const location: LocationTelemetry = {
            latitude: this.latitude,
            longitude: this.longitude,
            altitude: 0,
            speed: 0,
            heading: 0,
            accuracy: 0,
            satellites: 0,
            fix: true
        };

        this.subscribers.forEach(subscriber => {
            try {
                subscriber.onLocation(location);
            } catch (error) {
                subscriber.onError(error instanceof Error ? error : new Error('Unknown error'));
            }
        });
    }
}