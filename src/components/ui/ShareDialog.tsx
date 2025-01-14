import React from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';

interface ShareDialogProps {
  visible: boolean;
  onClose: () => void;
  onShare: () => void;
  fileName: string;
  isSharing?: boolean;
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  visible,
  onClose,
  onShare,
  fileName,
  isSharing = false,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: 'rgba(0,0,0,0.5)' 
      }}>
        <View style={{ 
          backgroundColor: 'white', 
          padding: 20, 
          borderRadius: 8, 
          width: '80%',
          maxWidth: 400,
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Share File
          </Text>
          <Text style={{ marginBottom: 20 }}>
            Filename: {fileName}
          </Text>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'flex-end',
            alignItems: 'center'
          }}>
            {isSharing && (
              <ActivityIndicator 
                size="small" 
                color="#007AFF" 
                style={{ marginRight: 10 }}
              />
            )}
            <TouchableOpacity 
              onPress={onClose}
              style={{ 
                marginRight: 10,
                padding: 8,
              }}
              disabled={isSharing}
            >
              <Text style={{ 
                color: isSharing ? '#999' : '#000'
              }}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={onShare}
              style={{ 
                padding: 8,
                opacity: isSharing ? 0.7 : 1
              }}
              disabled={isSharing}
            >
              <Text style={{ 
                color: '#007AFF',
                fontWeight: '600'
              }}>
                {isSharing ? 'Sharing...' : 'Share'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};