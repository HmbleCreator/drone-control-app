// AttitudeIndicator.tsx
import React from 'react';
import { View, Text } from 'react-native'; // Added Text import
import { Card } from '../common/Card';
// We need to install react-native-svg first. Add this to your dependencies:
// yarn add react-native-svg
// or
// npm install react-native-svg
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

type AttitudeIndicatorProps = {
  pitch: number; // in degrees (-90 to +90)
  roll: number;  // in degrees (-180 to +180)
  size?: number; // diameter of the indicator
}

export const AttitudeIndicator: React.FC<AttitudeIndicatorProps> = ({
  pitch,
  roll,
  size = 200
}) => {
  // Constrain pitch to -90 to +90 degrees
  const clampedPitch = Math.max(-90, Math.min(90, pitch));
  // Calculate horizon line position based on pitch
  const horizonOffset = (clampedPitch / 90) * (size / 2);
  
  return (
    <Card className="p-4">
      <View className="items-center">
        <Svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ overflow: 'hidden', borderRadius: size / 2 }}
        >
          {/* Sky and Ground */}
          <Path
            d={`M 0,${size / 2 + horizonOffset} 
                L ${size},${size / 2 + horizonOffset} 
                L ${size},0 
                L 0,0 Z`}
            fill="#87CEEB" // Sky blue
            transform={`rotate(${roll}, ${size / 2}, ${size / 2})`}
          />
          <Path
            d={`M 0,${size / 2 + horizonOffset} 
                L ${size},${size / 2 + horizonOffset} 
                L ${size},${size} 
                L 0,${size} Z`}
            fill="#8B4513" // Brown for ground
            transform={`rotate(${roll}, ${size / 2}, ${size / 2})`}
          />
          
          {/* Center point and reference lines */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={2}
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="1"
          />
          <Line
            x1={size / 2 - 40}
            y1={size / 2}
            x2={size / 2 - 10}
            y2={size / 2}
            stroke="#FFFFFF"
            strokeWidth="2"
          />
          <Line
            x1={size / 2 + 10}
            y1={size / 2}
            x2={size / 2 + 40}
            y2={size / 2}
            stroke="#FFFFFF"
            strokeWidth="2"
          />
        </Svg>
        <View className="mt-2">
          <Text style={{ fontSize: 14, color: '#666666' }}>
            Pitch: {pitch.toFixed(1)}° Roll: {roll.toFixed(1)}°
          </Text>
        </View>
      </View>
    </Card>
  );
};
