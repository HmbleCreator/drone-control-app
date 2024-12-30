import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { EmergencyControls } from '../../src/components/flight/EmergencyControls';

describe('EmergencyControls Component', () => {
  const mockEmergencyHandler = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders emergency button in normal state', () => {
    const { getByTestId } = render(
      <EmergencyControls onEmergency={mockEmergencyHandler} />
    );
    
    expect(getByTestId('emergency-button')).toBeTruthy();
  });

  it('triggers emergency procedure on button press', async () => {
    const { getByTestId } = render(
      <EmergencyControls onEmergency={mockEmergencyHandler} />
    );

    await act(async () => {
      fireEvent.press(getByTestId('emergency-button'));
    });

    expect(mockEmergencyHandler).toHaveBeenCalledTimes(1);
  });

  it('displays confirmation dialog before emergency action', async () => {
    const { getByTestId, getByText } = render(
      <EmergencyControls onEmergency={mockEmergencyHandler} />
    );

    await act(async () => {
      fireEvent.press(getByTestId('emergency-button'));
    });

    expect(getByText('Confirm Emergency Landing')).toBeTruthy();
  });
});