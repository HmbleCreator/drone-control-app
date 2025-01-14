import React from 'react';
import { View, Dimensions, Text as RNText, StyleSheet } from 'react-native';
import Svg, { Circle, Line, G, Text as SvgText } from 'react-native-svg';
import { colors } from './styles';

interface AttitudeIndicatorProps {
  pitch: number;  // degrees (-90 to 90)
  roll: number;   // degrees (-180 to 180)
  yaw: number;    // degrees (0 to 360)
}

export const AttitudeIndicator: React.FC<AttitudeIndicatorProps> = ({
  pitch,
  roll,
  yaw,
}) => {
  const size = Math.min(Dimensions.get('window').width - 32, 200); // Adjusted size
  
  return (
    <View style={[styles.card, { padding: 0 }]}>
      <View style={{ padding: 4 }}>
        <RNText style={styles.heading}>Attitude Indicator</RNText>
      </View>
      
      <Svg height={size} width={size} viewBox="-100 -100 200 200">
        {/* Outer circle */}
        <Circle
          r="98"
          stroke="white"
          strokeWidth="2"
          fill="#333"
        />
        
        {/* Attitude reference */}
        <G rotation={roll}>
          {/* Horizon line */}
          <Line
            x1="-90"
            y1={pitch}
            x2="90"
            y2={pitch}
            stroke="white"
            strokeWidth="2"
          />
          
          {/* Pitch reference lines */}
          {[-30, -20, -10, 10, 20, 30].map((p) => (
            <React.Fragment key={p}>
              <Line
                x1="-20"
                y1={p + pitch}
                x2="20"
                y2={p + pitch}
                stroke="white"
                strokeWidth="1"
              />
              <SvgText
                x="25"
                y={p + pitch}
                fill="white"
                fontSize="8"
                textAnchor="start"
              >
                {Math.abs(p)}°
              </SvgText>
            </React.Fragment>
          ))}
        </G>
        
        {/* Fixed aircraft reference */}
        <Line 
          x1="-90" 
          y1="0" 
          x2="-20" 
          y2="0" 
          stroke="red" 
          strokeWidth="2" 
        />
        <Line 
          x1="20" 
          y1="0" 
          x2="90" 
          y2="0" 
          stroke="red" 
          strokeWidth="2" 
        />
        <Line 
          x1="0" 
          y1="-20" 
          x2="0" 
          y2="20" 
          stroke="red" 
          strokeWidth="2" 
        />
      </Svg>
      
      <View style={[styles.row, { padding: 16 }]}>
        <RNText style={styles.label}>Roll: {roll.toFixed(1)}°</RNText>
        <RNText style={styles.label}>Pitch: {pitch.toFixed(1)}°</RNText>
        <RNText style={styles.label}>Yaw: {yaw.toFixed(1)}°</RNText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
    marginHorizontal: 2,
    alignItems: 'center',  // Center align the content
    padding: 16,  // Add padding for better spacing
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',  // Ensure the row takes full width
  },
  label: {
    fontSize: 14,
    color: '#333',
  },
});

export default AttitudeIndicator;
