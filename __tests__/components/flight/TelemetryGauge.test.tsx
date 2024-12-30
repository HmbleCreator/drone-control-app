import React from 'react';
import { render } from '@testing-library/react-native';
import { TelemetryGauge } from '../../src/components/flight/TelemetryGauge';

describe('TelemetryGauge Component', () => {
  const mockTelemetryData = {
    altitude: 100,
    speed: 15,
    batteryLevel: 75,
  };

  it('renders all telemetry values correctly', () => {
    const { getByTestId } = render(
      <TelemetryGauge data={mockTelemetryData} />
    );
    
    expect(getByTestId('altitude-gauge')).toHaveTextContent('100');
    expect(getByTestId('speed-gauge')).toHaveTextContent('15');
    expect(getByTestId('battery-gauge')).toHaveTextContent('75');
  });

  it('shows warning indicators for critical values', () => {
    const criticalData = { ...mockTelemetryData, batteryLevel: 15 };
    const { getByTestId } = render(
      <TelemetryGauge data={criticalData} />
    );
    
    expect(getByTestId('battery-warning')).toBeTruthy();
  });
});