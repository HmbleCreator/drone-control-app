import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

// Type definitions
interface Coordinate {
  latitude: number;
  longitude: number;
}

interface Waypoint {
  id: string;
  latitude: number;
  longitude: number;
  altitude: number;
  speed?: number;
  action?: string;
}

interface NoFlyZone {
  center: Coordinate;
  radius: number;
}

interface MissionMonitorProps {
  waypoints: Waypoint[];
  currentLocation: Coordinate;
  batteryLevel: number;
  signalStrength: number;
  onAlert: (message: string) => void;
  onStatusUpdate: (status: string) => void;
}

const MissionMonitor: React.FC<MissionMonitorProps> = ({
  waypoints,
  currentLocation,
  batteryLevel,
  signalStrength,
  onAlert,
  onStatusUpdate,
}) => {
  const [missionProgress, setMissionProgress] = useState(0);
  const [isInNoFlyZone, setIsInNoFlyZone] = useState(false);

  // Sample no-fly zones (replace with actual data)
  const noFlyZones: NoFlyZone[] = [
    { center: { latitude: 0, longitude: 0 }, radius: 1000 }, // meters
  ];

  // Check battery level
  useEffect(() => {
    if (batteryLevel < 20) {
      onAlert(`Low battery warning: ${batteryLevel}% remaining`);
    }
    if (batteryLevel < 10) {
      onAlert('Critical battery level! Return to home recommended');
    }
  }, [batteryLevel, onAlert]);

  // Check signal strength
  useEffect(() => {
    if (signalStrength < 50) {
      onAlert(`Weak signal strength: ${signalStrength}%`);
    }
    if (signalStrength < 20) {
      onAlert('Critical signal strength! Mission may be compromised');
    }
  }, [signalStrength, onAlert]);

  // Check for no-fly zones
  useEffect(() => {
    const checkNoFlyZones = () => {
      for (const zone of noFlyZones) {
        const distance = calculateDistance(currentLocation, zone.center);
        if (distance < zone.radius) {
          if (!isInNoFlyZone) {
            setIsInNoFlyZone(true);
            onAlert('Warning: Entering no-fly zone!');
          }
          return;
        }
      }
      if (isInNoFlyZone) {
        setIsInNoFlyZone(false);
      }
    };

    checkNoFlyZones();
  }, [currentLocation, isInNoFlyZone, onAlert]);

  // Update mission progress
  useEffect(() => {
    if (waypoints.length === 0) return;

    const calculateProgress = () => {
      // Find the nearest waypoint
      const distances = waypoints.map(wp => 
        calculateDistance(currentLocation, wp)
      );
      const nearestIndex = distances.indexOf(Math.min(...distances));
      const progress = (nearestIndex / waypoints.length) * 100;
      
      setMissionProgress(progress);
      onStatusUpdate(`Mission Progress: ${progress.toFixed(1)}%`);
    };

    calculateProgress();
  }, [currentLocation, waypoints, onStatusUpdate]);

  // Utility function to calculate distance between two coordinates
  const calculateDistance = (coord1: Coordinate, coord2: Coordinate): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (coord1.latitude * Math.PI) / 180;
    const φ2 = (coord2.latitude * Math.PI) / 180;
    const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  // This is a monitoring component, no UI needed
  return null;
};

export default MissionMonitor;