// UpdateAltitudeModal.tsx
import React, { useState } from 'react';
import { Modal, TextInput, TouchableOpacity, Text, View, StyleSheet } from 'react-native';

interface UpdateAltitudeModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (newAltitude: number) => void;
  currentAltitude: number;
}

const UpdateAltitudeModal: React.FC<UpdateAltitudeModalProps> = ({
  visible,
  onClose,
  onSave,
  currentAltitude,
}) => {
  const [newAltitude, setNewAltitude] = useState(currentAltitude);

  const handleChangeText = (text: string) => {
    const altitude = parseFloat(text);
    setNewAltitude(isNaN(altitude) ? 0 : altitude);
  };

  return (
    <Modal visible={visible} transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Update Altitude</Text>
          <TextInput
            style={styles.textInput}
            keyboardType="numeric"
            value={String(newAltitude)}
            onChangeText={handleChangeText}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => onSave(newAltitude)}
            >
              <Text style={styles.buttonText}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#007bff',
  },
});

export default UpdateAltitudeModal;