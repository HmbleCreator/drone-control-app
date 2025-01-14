// MissionStatusIndicator.tsx
import React, { useEffect } from 'react';
import { View, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface MissionStatusIndicatorProps {
  isActive: boolean;
  onPress: () => void;
}

const MissionStatusIndicator: React.FC<MissionStatusIndicatorProps> = ({
  isActive,
  onPress,
}) => {
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    
    if (isActive) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    } else {
      pulseAnim.setValue(1);
    }

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [isActive]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.pulseCircle,
          {
            transform: [{ scale: pulseAnim }],
            backgroundColor: isActive ? '#4CAF50' : '#757575',
          },
        ]}
      />
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={isActive ? "stop-circle" : "play-circle"}
          size={24}
          color="white"
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  pulseCircle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.7,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default MissionStatusIndicator;