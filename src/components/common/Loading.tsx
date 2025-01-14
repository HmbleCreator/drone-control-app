// Loading.tsx
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface LoadingProps {
  text?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
  color?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  text = 'Loading...',
  size = 'large',
  fullScreen = false,
  color = '#0066CC'
}) => {
  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, styles.center]}>
        <View style={styles.spaceLarge}>
          <ActivityIndicator size={size} color={color} />
          {text && (
            <Text style={styles.text}>
              {text}
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <View style={styles.spaceSmall}>
        <ActivityIndicator size={size} color={color} />
        {text && (
          <Text style={styles.text}>
            {text}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'white',
    opacity: 0.9,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spaceLarge: {
    marginVertical: 16, // Adjust as needed
  },
  spaceSmall: {
    marginVertical: 8, // Adjust as needed
  },
  text: {
    color: 'gray',
    fontWeight: '500',
    textAlign: 'center',
  }
});
