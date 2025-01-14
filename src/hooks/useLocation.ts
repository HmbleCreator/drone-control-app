// hooks/useLocation.ts
import { useState, useEffect } from 'react';
import { LocationTelemetry } from '../core/communication/TelemetryModels';
import { PositionEstimator } from '../core/flight-control/PositionEstimator';
import { GeofenceManager } from '../core/safety/GeofenceManager';

interface Coordinates {
    latitude: number;
    longitude: number;
    altitude?: number;
}

interface LocationState {
    coordinates: Coordinates | null;
    accuracy: number | null;
    heading: number | null;
    speed: number | null;
    isWithinGeofence: boolean;
    distanceToHome: number | null;
}

export const useLocation = (homePosition?: Coordinates) => {
    const [locationState, setLocationState] = useState<LocationState>({
        coordinates: null,
        accuracy: null,
        heading: null,
        speed: null,
        isWithinGeofence: true,
        distanceToHome: null
    });
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const positionEstimator = new PositionEstimator();
        const geofenceManager = new GeofenceManager();
        let mounted = true;

        const initializeLocation = async () => {
            try {
                await positionEstimator.initialize();

                if (homePosition) {
                    geofenceManager.setHomePosition(homePosition);
                }
            } catch (err) {
                if (mounted) {
                    setError(err instanceof Error ? err : new Error('Failed to initialize location services'));
                }
            }
        };

        initializeLocation();

        const locationSubscription = positionEstimator.subscribe({
            onLocation: (location: LocationTelemetry) => {
                if (!mounted) return;

                const coordinates: Coordinates = {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    altitude: location.altitude
                };

                const isWithinGeofence = geofenceManager.checkPosition(coordinates);
                const distanceToHome = homePosition ?
                    geofenceManager.calculateDistanceToHome(coordinates) :
                    null;

                setLocationState({
                    coordinates,
                    accuracy: location.accuracy,
                    heading: location.heading,
                    speed: location.speed,
                    isWithinGeofence,
                    distanceToHome
                });
            },
            onError: (err: Error) => {
                if (mounted) {
                    setError(err);
                }
            }
        });

        return () => {
            mounted = false;
            locationSubscription.unsubscribe();
            positionEstimator.cleanup();
        };
    }, [homePosition]);

    return {
        ...locationState,
        error,
        isLocationAvailable: locationState.coordinates !== null
    };
};