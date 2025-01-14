// src/core/notifications/NotificationService.ts
import { Alert, Vibration, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DroneCommand } from '../communication/TelemetryModels';
import { DataLink } from '../communication/DataLink';

export enum NotificationPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL'
}

export interface NotificationConfig {
    title: string;
    message: string;
    priority: NotificationPriority;
    vibrate?: boolean;
    persistent?: boolean;  // Added this property
}

export interface NotificationHistoryItem {
    timestamp: number;
    title: string;
    message: string;
    priority: NotificationPriority;
}

export class NotificationService {
    private static instance: NotificationService;
    private notificationHistory: NotificationHistoryItem[] = [];
    private readonly MAX_HISTORY = 100;
    private readonly STORAGE_KEY = '@drone_notifications';
    private dataLink: DataLink;

    private constructor() {
        this.dataLink = DataLink.getInstance();
        this.loadNotificationHistory();
    }

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    private async loadNotificationHistory(): Promise<void> {
        try {
            const history = await AsyncStorage.getItem(this.STORAGE_KEY);
            if (history) {
                this.notificationHistory = JSON.parse(history);
            }
        } catch (error) {
            console.error('Failed to load notification history:', error);
        }
    }

    private async saveNotificationHistory(): Promise<void> {
        try {
            await AsyncStorage.setItem(
                this.STORAGE_KEY,
                JSON.stringify(this.notificationHistory)
            );
        } catch (error) {
            console.error('Failed to save notification history:', error);
        }
    }

    public async notify(config: NotificationConfig): Promise<void> {
        // Add to history
        const historyItem: NotificationHistoryItem = {
            timestamp: Date.now(),
            title: config.title,
            message: config.message,
            priority: config.priority
        };
        this.notificationHistory.unshift(historyItem);
        if (this.notificationHistory.length > this.MAX_HISTORY) {
            this.notificationHistory.pop();
        }
        await this.saveNotificationHistory();

        // Handle vibration
        if (config.vibrate || config.priority === NotificationPriority.CRITICAL) {
            if (Platform.OS === 'android') {
                Vibration.vibrate([0, 500, 200, 500]);
            } else {
                // iOS: shorter vibration
                Vibration.vibrate(1000);
            }
        }

        // Show alert based on priority
        switch (config.priority) {
            case NotificationPriority.CRITICAL:
                Alert.alert(
                    config.title,
                    config.message,
                    [
                        {
                            text: 'Emergency Land',
                            onPress: () => this.triggerEmergencyLand(),
                            style: 'destructive'
                        },
                        { 
                            text: 'Return to Home',
                            onPress: () => this.triggerReturnToHome()
                        },
                        { 
                            text: 'Acknowledge',
                            style: 'cancel'
                        }
                    ],
                    { cancelable: false }
                );
                break;
            case NotificationPriority.HIGH:
                Alert.alert(
                    config.title,
                    config.message,
                    [{ text: 'OK', style: 'cancel' }],
                    { cancelable: true }
                );
                break;
            case NotificationPriority.MEDIUM:
            case NotificationPriority.LOW:
                console.warn(`${config.title}: ${config.message}`);
                break;
        }
    }

    private async triggerEmergencyLand(): Promise<void> {
        try {
            const command: DroneCommand = {
                type: 'EMERGENCY',
                id: `emergency-${Date.now()}`,
                timestamp: Date.now(),
                payload: null
            };

            await this.dataLink.sendCommand(command);
            
            // Show confirmation alert
            Alert.alert(
                'Emergency Landing Initiated',
                'The drone is performing an emergency landing. Please ensure the area below is clear.',
                [{ text: 'OK' }]
            );

            // Log the event
            await this.notify({
                title: 'Emergency Landing',
                message: 'Emergency landing procedure initiated',
                priority: NotificationPriority.HIGH
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error('Emergency landing failed:', errorMessage);
            
            Alert.alert(
                'Emergency Landing Failed',
                `Failed to initiate emergency landing: ${errorMessage}. Please attempt manual control.`,
                [{ text: 'OK' }]
            );
        }
    }

    private async triggerReturnToHome(): Promise<void> {
        try {
            const command: DroneCommand = {
                type: 'RTH',
                id: `rth-${Date.now()}`,
                timestamp: Date.now(),
                payload: undefined
            };

            await this.dataLink.sendCommand(command);
            
            // Show confirmation alert
            Alert.alert(
                'Return to Home Initiated',
                'The drone is returning to its home position.',
                [{ text: 'OK' }]
            );

            // Log the event
            await this.notify({
                title: 'Return to Home',
                message: 'RTH procedure initiated',
                priority: NotificationPriority.MEDIUM
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error('Return to home failed:', errorMessage);
            
            Alert.alert(
                'Return to Home Failed',
                `Failed to initiate RTH: ${errorMessage}. Please attempt manual control.`,
                [{ text: 'OK' }]
            );
        }
    }

    public getNotificationHistory(): NotificationHistoryItem[] {
        return [...this.notificationHistory];
    }

    public async clearHistory(): Promise<void> {
        this.notificationHistory = [];
        await this.saveNotificationHistory();
    }
}