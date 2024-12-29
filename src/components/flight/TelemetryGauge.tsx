// TelemetryGauge.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '../common/Card';

type TelemetryGaugeProps = {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  warningThreshold?: number;
  criticalThreshold?: number;
}

export const TelemetryGauge: React.FC<TelemetryGaugeProps> = ({
  label,
  value,
  unit,
  min,
  max,
  warningThreshold,
  criticalThreshold
}) => {
  const percentage = ((value - min) / (max - min)) * 100;
  
  const getStatusColor = () => {
    if (criticalThreshold && value >= criticalThreshold) return { backgroundColor: '#EF4444' }; // red-500
    if (warningThreshold && value >= warningThreshold) return { backgroundColor: '#F59E0B' }; // yellow-500
    return { backgroundColor: '#10B981' }; // green-500
  };

  return (
    <Card className="p-4">
      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>{label}</Text>
        <View style={{ width: '100%', height: 16, backgroundColor: '#E5E7EB', borderRadius: 9999, overflow: 'hidden' }}>
          <View 
            style={[
              { height: '100%', width: `${Math.min(100, Math.max(0, percentage))}%` },
              getStatusColor()
            ]}
          />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 14, color: '#666666' }}>{min}</Text>
          <Text style={{ fontSize: 18, fontWeight: '700' }}>
            {value.toFixed(1)} {unit}
          </Text>
          <Text style={{ fontSize: 14, color: '#666666' }}>{max}</Text>
        </View>
      </View>
    </Card>
  );
};