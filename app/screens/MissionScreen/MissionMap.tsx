
// MissionMap.tsx
import React, { useState, useCallback } from 'react';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, MapType } from 'react-native-maps';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

export interface Waypoint {
  id: string;
  latitude: number;
  longitude: number;
  altitude: number;
  speed?: number;
  action?: string;
}

interface MissionMapProps {
  waypoints: Waypoint[];
  currentLocation: { latitude: number; longitude: number };
  onWaypointDragEnd: (waypointId: string, coordinate: { latitude: number; longitude: number }) => void;
  onMapPress: (coordinate: { latitude: number; longitude: number }) => void;
  showsUserLocation?: boolean;
}

const MissionMap: React.FC<MissionMapProps> = ({
  waypoints = [],
  currentLocation,
  onWaypointDragEnd,
  onMapPress,
  showsUserLocation = true,
}) => {
  const [mapType, setMapType] = useState<MapType>('standard');
  const [region, setRegion] = useState({
    latitude: currentLocation.latitude || 0,
    longitude: currentLocation.longitude || 0,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const handleMapTypeChange = useCallback(() => {
    setMapType(prevType => {
      switch (prevType) {
        case 'standard':
          return 'satellite';
        case 'satellite':
          return 'hybrid';
        case 'hybrid':
          return 'terrain';
        default:
          return 'standard';
      }
    });
  }, []);

  const centerOnCurrentLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        onRegionChangeComplete={setRegion}
        onPress={(e) => onMapPress(e.nativeEvent.coordinate)}
        showsUserLocation={showsUserLocation}
        showsMyLocationButton={false}
        showsCompass={true}
        mapType={mapType}
        followsUserLocation={true}
      >
        {waypoints.map((waypoint, index) => (
          <Marker
            key={waypoint.id}
            coordinate={{
              latitude: waypoint.latitude,
              longitude: waypoint.longitude
            }}
            draggable
            onDragEnd={(e) => onWaypointDragEnd(waypoint.id, e.nativeEvent.coordinate)}
            title={`Waypoint ${index + 1}`}
            description={`Alt: ${waypoint.altitude}m${waypoint.speed ? `, Speed: ${waypoint.speed}m/s` : ''}`}
          />
        ))}
        {waypoints.length > 1 && (
          <Polyline
            coordinates={waypoints.map((wp) => ({
              latitude: wp.latitude,
              longitude: wp.longitude,
            }))}
            strokeWidth={2}
            strokeColor="#2196f3"
          />
        )}
      </MapView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.mapButton}
          onPress={handleMapTypeChange}
        >
          <MaterialCommunityIcons name="map" size={24} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mapButton}
          onPress={centerOnCurrentLocation}
        >
          <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    right: 16,
    top: 16,
    gap: 8,
  },
  mapButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default MissionMap;