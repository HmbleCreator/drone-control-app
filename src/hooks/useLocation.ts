import { useState, useEffect } from 'react';
import { Coordinates } from '../types/mission';
import { GPSStatus } from '../types/telemetry';
import PositionEstimator from '../core/flight-control/PositionEstimator';

// Define interfaces for the position estimator callbacks
interface LocationSubscriber {
  onLocation: (coords: Coordinates) => void;
  onGpsStatus: (status: GPSStatus) => void;
  onAccuracyChange: (accuracy: number) => void;
}

interface LocationSubscription {
  unsubscribe: () => void;
}

// Export these interfaces if they're not already defined in PositionEstimator
export type { LocationSubscriber, LocationSubscription };

export const useLocation = () => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [gpsStatus, setGpsStatus] = useState<GPSStatus | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);

  useEffect(() => {
    const positionEstimator = new PositionEstimator();
    let mounted = true;

    const locationSubscription = positionEstimator.subscribe({
      onLocation: (coords: Coordinates) => {
        if (mounted) {
          setLocation(coords);
        }
      },
      onGpsStatus: (status: GPSStatus) => {
        if (mounted) {
          setGpsStatus(status);
        }
      },
      onAccuracyChange: (acc: number) => {
        if (mounted) {
          setAccuracy(acc);
        }
      }
    });

    return () => {
      mounted = false;
      locationSubscription.unsubscribe();
    };
  }, []);

  return { location, gpsStatus, accuracy };
};