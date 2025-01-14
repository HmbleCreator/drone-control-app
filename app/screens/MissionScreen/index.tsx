// MissionScreen.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import uuid from 'react-native-uuid';
import * as Location from 'expo-location';
import MissionMap, { Waypoint } from './MissionMap';
import WaypointEditor from './WaypointEditor';
import Notification from './Notification';
import MissionStatusIndicator from './MissionStatusIndicator';

interface Coordinate {
  latitude: number;
  longitude: number;
}

const MissionScreen: React.FC = () => {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Coordinate>({
    latitude: 0,
    longitude: 0,
  });
  const [notifications, setNotifications] = useState<string[]>([]);
  const [isMissionActive, setIsMissionActive] = useState<boolean>(false);
  const [missionStatus, setMissionStatus] = useState<string>('Mission inactive');

  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setNotifications(prev => [...prev, 'Location permission is required']);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        setNotifications(prev => [...prev, 'Failed to get current location']);
      }
    };

    getLocation();

    // Set up location updates
    const locationSubscription = Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 1
      },
      (location) => {
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    );

    return () => {
      locationSubscription.then(sub => sub.remove());
    };
  }, []);

  const handleMapPress = (coordinate: Coordinate) => {
    if (!isMissionActive) {
      const newWaypoint: Waypoint = {
        id: uuid.v4(),
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        altitude: 50, // Default altitude
        speed: 5, // Default speed
      };
      setWaypoints(prev => [...prev, newWaypoint]);
      setNotifications(prev => [...prev, 'New waypoint added']);
    } else {
      setNotifications(prev => [...prev, 'Cannot add waypoints during active mission']);
    }
  };

  const handleWaypointDragEnd = (waypointId: string, coordinate: Coordinate) => {
    if (!isMissionActive) {
      const updatedWaypoints = waypoints.map(wp =>
        wp.id === waypointId
          ? { ...wp, latitude: coordinate.latitude, longitude: coordinate.longitude }
          : wp
      );
      setWaypoints(updatedWaypoints);
      setNotifications(prev => [...prev, 'Waypoint position updated']);
    }
  };

  const handleStartMission = () => {
    if (waypoints.length < 2) {
      setNotifications(prev => [...prev, 'At least 2 waypoints are required to start mission']);
      return;
    }
    setIsMissionActive(true);
    setMissionStatus('Mission in progress');
    setNotifications(prev => [...prev, 'Mission started']);
  };

  const handleStopMission = () => {
    setIsMissionActive(false);
    setMissionStatus('Mission inactive');
    setNotifications(prev => [...prev, 'Mission stopped']);
  };

  const handleWaypointDelete = (id: string) => {
    if (!isMissionActive) {
      setWaypoints(prev => prev.filter(wp => wp.id !== id));
      setNotifications(prev => [...prev, 'Waypoint deleted']);
    } else {
      setNotifications(prev => [...prev, 'Cannot delete waypoints during active mission']);
    }
  };

  const handleWaypointReorder = (newWaypoints: Waypoint[]) => {
    if (!isMissionActive) {
      setWaypoints(newWaypoints);
      setNotifications(prev => [...prev, 'Waypoints reordered']);
    } else {
      setNotifications(prev => [...prev, 'Cannot reorder waypoints during active mission']);
    }
  };

  // Clear old notifications after 5 seconds
  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications(prev => prev.slice(1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  return (
    <SafeAreaView style={styles.container}>
      <MissionMap
        waypoints={waypoints}
        currentLocation={currentLocation}
        onWaypointDragEnd={handleWaypointDragEnd}
        onMapPress={handleMapPress}
        showsUserLocation={true}
      />
      <WaypointEditor
        waypoints={waypoints}
        onWaypointUpdate={setWaypoints}
        onWaypointDelete={handleWaypointDelete}
        onWaypointReorder={handleWaypointReorder}
      />
      {notifications.length > 0 && <Notification messages={notifications} />}
      <MissionStatusIndicator
        isActive={isMissionActive}
        onPress={isMissionActive ? handleStopMission : handleStartMission}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default MissionScreen;