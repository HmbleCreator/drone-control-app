// MissionPlannerScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { WaypointMarker } from '../components/mission/WaypointMarker';
import { MissionPathOverlay } from '../components/mission/MissionPathOverlay';
import { Button } from '../components/common/Button';
import { useMission } from '../hooks/useMission';
import type { Waypoint, Coordinates } from '../types/mission';

export const MissionPlannerScreen: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(null);
  const { mission, updateMission, startMission } = useMission();

  const handleMapLongPress = useCallback((e: any) => {
    if (!isEditing) return;

    const newWaypoint: Waypoint = {
      id: Date.now().toString(),
      type: 'hover',
      coordinates: {
        latitude: e.nativeEvent.coordinate.latitude,
        longitude: e.nativeEvent.coordinate.longitude,
        altitude: 50, // Default altitude
      },
    };

    updateMission([...mission.waypoints, newWaypoint]);
  }, [isEditing, mission, updateMission]);

  const handleWaypointDrag = useCallback((waypoint: Waypoint, coordinates: Coordinates) => {
    const updatedWaypoints = mission.waypoints.map(wp =>
      wp.id === waypoint.id ? { ...wp, coordinates } : wp
    );
    updateMission({ ...mission, waypoints: updatedWaypoints });
  }, [mission, updateMission]);

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
        <Button
          onPress={() => setIsEditing(!isEditing)}
          variant={isEditing ? 'primary' : 'secondary'}
        >
          {isEditing ? 'Done Editing' : 'Edit Mission'}
        </Button>
        <Button
          onPress={startMission}
          variant="primary"
          disabled={mission.waypoints.length < 2}
        >
          Start Mission
        </Button>
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
});