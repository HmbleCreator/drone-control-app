import React, { useState, useCallback } from 'react';
import { View, SafeAreaView, StyleSheet, Text } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { WaypointMarker } from '../components/mission/WaypointMarker';
import { MissionPathOverlay } from '../components/mission/MissionPathOverlay';
import { Button } from '../components/common/Button';
import { useMission } from '../hooks/useMission';
import { Waypoint, Coordinates,  MissionStatus, Mission } from '../types/mission';

export const MissionPlannerScreen: React.FC<{ missionId: string }> = ({ missionId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(null);
  const { mission, updateMission, isLoading } = useMission(missionId);

  const handleMapLongPress = useCallback((e: { nativeEvent: { coordinate: Coordinates } }) => {
    if (!isEditing || !mission) return;

    const newWaypoint: Waypoint = {  // Changed from Omit to full Waypoint type
      id: `wp-${Date.now()}`,  // Generate a unique ID
      type: 'hover',
      coordinates: {
        latitude: e.nativeEvent.coordinate.latitude,
        longitude: e.nativeEvent.coordinate.longitude,
        altitude: 50, // Default altitude
      },
      heading: 0,
      speed: mission.settings.maxSpeed / 2, // Default to half max speed
      hoverTime: 0
    };

    updateMission({
      waypoints: [...mission.waypoints, newWaypoint],
      updatedAt: Date.now()
    });
  }, [isEditing, mission, updateMission]);

  const handleWaypointDrag = useCallback((waypoint: Waypoint, coordinates: Coordinates) => {
    if (!mission) return;

    const updatedWaypoints = mission.waypoints.map(wp =>
      wp.id === waypoint.id ? { ...wp, coordinates } : wp
    );
    
    updateMission({
      waypoints: updatedWaypoints,
      updatedAt: Date.now()
    });
  }, [mission, updateMission]);

  const canEditMission = useCallback((mission: Mission): boolean => {
    return mission.status === MissionStatus.DRAFT || mission.status === MissionStatus.PLANNED;
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text>Loading mission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!mission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text>No mission found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        onLongPress={handleMapLongPress}
      >
        <MissionPathOverlay
          waypoints={mission.waypoints}
          isEditing={isEditing}
        />
        {mission.waypoints.map(waypoint => (
          <WaypointMarker
            key={waypoint.id}
            waypoint={waypoint}
            isSelected={selectedWaypoint?.id === waypoint.id}
            isEditing={isEditing}
            onPress={setSelectedWaypoint}
            onLongPress={() => {}}
            onDragEnd={handleWaypointDrag}
          />
        ))}
      </MapView>

      <View style={styles.controls}>
        {canEditMission(mission) && (
          <Button
            onPress={() => setIsEditing(!isEditing)}
            variant={isEditing ? 'primary' : 'secondary'}
          >
            {isEditing ? 'Done Editing' : 'Edit Mission'}
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MissionPlannerScreen;