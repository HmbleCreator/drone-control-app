import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Marker } from 'react-native-maps';
import type { Waypoint, Coordinates } from '../../types/mission';

interface WaypointMarkerProps {
  waypoint: Waypoint;
  isSelected: boolean;
  isEditing: boolean;
  onPress: (waypoint: Waypoint) => void;
  onLongPress: (waypoint: Waypoint) => void;
  onDragEnd: (waypoint: Waypoint, coordinates: Coordinates) => void;
}

export const WaypointMarker: React.FC<WaypointMarkerProps> = ({
  waypoint,
  isSelected,
  isEditing,
  onPress,
  onLongPress,
  onDragEnd,
}) => {
  const getMarkerColor = () => {
    switch (waypoint.type) {
      case 'takeoff': return '#10B981'; // green
      case 'landing': return '#EF4444'; // red
      case 'photo': return '#3B82F6';   // blue
      case 'video': return '#6366F1';   // indigo
      case 'hover': return '#F59E0B';   // yellow
      default: return '#6B7280';        // gray
    }
  };

  const getMarkerIcon = () => {
    switch (waypoint.type) {
      case 'takeoff': return '🛫';
      case 'landing': return '🛬';
      case 'photo': return '📸';
      case 'video': return '🎥';
      case 'hover': return '⏱️';
      case 'speed_change': return '⚡';
      case 'altitude_change': return '↕️';
      default: return '📍';
    }
  };

  const altitude = waypoint.actionParams?.targetAltitude ?? waypoint.coordinates.altitude ?? 0;

  const markerContent = (
    <>
      <View style={[
        styles.markerContainer,
        {
          backgroundColor: getMarkerColor(),
          borderWidth: isSelected ? 3 : 0,
        }
      ]}>
        <Text style={styles.markerIcon}>{getMarkerIcon()}</Text>
      </View>
      {altitude > 0 && (
        <View style={styles.altitudeContainer}>
          <Text style={styles.altitudeText}>{altitude}m</Text>
        </View>
      )}
    </>
  );

  return (
    <Marker
      coordinate={{
        latitude: waypoint.coordinates.latitude,
        longitude: waypoint.coordinates.longitude,
      }}
      draggable={isEditing}
      onPress={() => onPress(waypoint)}
      onCalloutPress={() => onLongPress(waypoint)} // Changed from onLongPress to onCalloutPress
      onDragEnd={(e) => onDragEnd(waypoint, e.nativeEvent.coordinate)}
    >
      <Pressable
        onLongPress={() => onLongPress(waypoint)}
      >
        {markerContent}
      </Pressable>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    padding: 8,
    borderRadius: 8,
    borderColor: '#000000',
  },
  markerIcon: {
    fontSize: 20,
  },
  altitudeContainer: {
    position: 'absolute',
    top: -24,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 4,
    borderRadius: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  altitudeText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
});