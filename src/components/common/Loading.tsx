// Loading.tsx
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

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
      <View className="absolute inset-0 bg-white bg-opacity-90 items-center justify-center">
        <View className="space-y-4 items-center">
          <ActivityIndicator size={size} color={color} />
          {text && (
            <Text className="text-gray-600 font-medium text-center">
              {text}
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View className="p-4 items-center justify-center">
      <View className="space-y-2 items-center">
        <ActivityIndicator size={size} color={color} />
        {text && (
          <Text className="text-gray-600 font-medium text-center">
            {text}
          </Text>
        )}
      </View>
    </View>
  );
};