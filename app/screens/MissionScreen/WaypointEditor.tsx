// WaypointEditor.tsx
import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Waypoint } from './MissionMap';
import UpdateAltitudeModal from './UpdateAltitudeModal';

interface WaypointEditorProps {
  waypoints: Waypoint[];
  onWaypointUpdate: (waypoints: Waypoint[]) => void;
  onWaypointDelete: (waypointId: string) => void;
  onWaypointReorder: (waypoints: Waypoint[]) => void;
}

const WaypointEditor: React.FC<WaypointEditorProps> = ({
  waypoints,
  onWaypointUpdate,
  onWaypointDelete,
  onWaypointReorder,
}) => {
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const openUpdateAltitudeModal = (waypoint: Waypoint) => {
    setSelectedWaypoint(waypoint);
    setModalVisible(true);
  };

  const handleSaveAltitude = (newAltitude: number) => {
    if (selectedWaypoint) {
      const updatedWaypoints = waypoints.map(wp =>
        wp.id === selectedWaypoint.id ? { ...wp, altitude: newAltitude } : wp
      );
      onWaypointUpdate(updatedWaypoints);
      setSelectedWaypoint(null);
      setModalVisible(false);
    }
  };

  const renderWaypoint = ({ item, drag }: { item: Waypoint; drag: () => void }) => {
    return (
      <TouchableOpacity
        style={styles.waypointItem}
        onLongPress={drag}
      >
        <TouchableOpacity style={styles.dragHandle} onPressIn={drag}>
          <MaterialCommunityIcons name="drag" size={24} color="#757575" />
        </TouchableOpacity>

        <View style={styles.waypointItemText}>
          <Text>Lat: {item.latitude.toFixed(6)}</Text>
          <Text>Lon: {item.longitude.toFixed(6)}</Text>
          <Text>Alt: {item.altitude}m</Text>
          {item.speed && <Text>Speed: {item.speed}m/s</Text>}
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onWaypointDelete(item.id)}
        >
          <MaterialCommunityIcons name="delete" size={24} color="#f44336" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openUpdateAltitudeModal(item)}
        >
          <MaterialCommunityIcons name="pencil" size={24} color="#4caf50" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.editorContainer}>
      <Text style={styles.title}>Waypoints</Text>

      <DraggableFlatList
        data={waypoints}
        renderItem={renderWaypoint}
        keyExtractor={(item) => item.id}
        onDragEnd={({ data }) => onWaypointReorder(data)}
        style={styles.waypointList}
      />

      <UpdateAltitudeModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveAltitude}
        currentAltitude={selectedWaypoint ? selectedWaypoint.altitude : 0}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#4caf50' }]}
          onPress={() => {
            Alert.alert(
              'Save Mission',
              'Do you want to save the current mission?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Save', onPress: () => {/* Implement save logic */} }
              ]
            );
          }}
        >
          <Text style={styles.buttonText}>Save Mission</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#f44336' }]}
          onPress={() => {
            Alert.alert(
              'Clear Mission',
              'Are you sure you want to clear all waypoints?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', onPress: () => onWaypointUpdate([]) }
              ]
            );
          }}
        >
          <Text style={styles.buttonText}>Clear All</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({  // Change this line
  editorContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  waypointList: {
    maxHeight: 200,
  },
  waypointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
  },
  dragHandle: {
    marginRight: 12,
  },
  waypointItemText: {
    flex: 1,
  },
  actionButton: {
    padding: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default WaypointEditor;