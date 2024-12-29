// src/components/flight/AttitudeIndicator.tsx

import React from 'react';

interface AttitudeIndicatorProps {
    roll: number; // Roll angle in degrees
    pitch: number; // Pitch angle in degrees
    yaw: number; // Yaw angle in degrees
}

const AttitudeIndicator: React.FC<AttitudeIndicatorProps> = ({ roll, pitch, yaw }) => {
    return (
        <div style={{ textAlign: 'center' }}>
            <h2>Attitude Indicator</h2>
            <p>Roll: {roll}°</p>
            <p>Pitch: {pitch}°</p>
            <p>Yaw: {yaw}°</p>
            {/* You can add a visual representation here */}
        </div>
    );
};

export default AttitudeIndicator;