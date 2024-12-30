import React from 'react';
import { render } from '@testing-library/react-native';
import { AttitudeIndicator } from '../../src/components/flight/AttitudeIndicator';

describe('AttitudeIndicator Component', () => {
  const mockAttitudeData = {
    pitch: 10,
    roll: 20,
    yaw: 30,
  };

  it('renders correctly with initial attitude data', () => {
    const { getByTestId } = render(
      <AttitudeIndicator attitude={mockAttitudeData} />
    );
    
    expect(getByTestId('attitude-display')).toBeTruthy();
    expect(getByTestId('pitch-value')).toHaveTextContent('10');
    expect(getByTestId('roll-value')).toHaveTextContent('20');
  });

  it('updates display when attitude changes', () => {
    const { getByTestId, rerender } = render(
      <AttitudeIndicator attitude={mockAttitudeData} />
    );

    const newAttitude = { ...mockAttitudeData, pitch: 15 };
    rerender(<AttitudeIndicator attitude={newAttitude} />);
    
    expect(getByTestId('pitch-value')).toHaveTextContent('15');
  });

  it('displays warning for extreme attitudes', () => {
    const extremeAttitude = { pitch: 45, roll: 60, yaw: 30 };
    const { getByTestId } = render(
      <AttitudeIndicator attitude={extremeAttitude} />
    );
    
    expect(getByTestId('attitude-warning')).toBeTruthy();
  });
});
