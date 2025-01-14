// Notification.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface NotificationProps {
  messages: string[];
}

const Notification: React.FC<NotificationProps> = ({ messages }) => (
  <View style={styles.notificationContainer}>
    {messages.map((message, index) => (
      <Text key={index} style={styles.notificationText}>
        {message}
      </Text>
    ))}
  </View>
);

const styles = StyleSheet.create({
  notificationContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 204, 0, 0.9)',
    padding: 10,
    borderRadius: 5,
    margin: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  notificationText: {
    color: '#000',
    fontSize: 14,
    marginVertical: 2,
  },
});

export default Notification;