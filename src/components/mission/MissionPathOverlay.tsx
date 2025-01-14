import React, { useMemo } from 'react';
import { Polyline } from 'react-native-maps';
import type { Waypoint } from '../../types/mission';

interface MissionPathOverlayProps {
  waypoints: Waypoint[];
  isEditing: boolean;
}

export const MissionPathOverlay: React.FC<MissionPathOverlayProps> = ({
  waypoints,
  isEditing,
}) => {
  const coordinates = useMemo(() => 
    waypoints.map(waypoint => ({
      latitude: waypoint.coordinates.latitude,
      longitude: waypoint.coordinates.longitude,
    })),
    [waypoints]
  );

  const getPathStyle = () => ({
    strokeWidth: isEditing ? 3 : 2,
    strokeColor: isEditing ? '#3B82F6' : '#6B7280', // blue when editing, gray otherwise
    lineDashPattern: isEditing ? [5, 5] : undefined, // dashed line when editing
  });

  const renderAltitudeGradient = () => {
    if (waypoints.length < 2) return null;

    return waypoints.slice(0, -1).map((waypoint, index) => {
      const nextWaypoint = waypoints[index + 1];
      const startAlt = waypoint.coordinates.altitude ?? 0;
      const endAlt = nextWaypoint.coordinates.altitude ?? 0;

      // Color gradient based on altitude change
      const color = startAlt < endAlt ? '#10B981' : // green for ascending
                   startAlt > endAlt ? '#EF4444' : // red for descending
                   '#6B7280'; // gray for level flight

      return (
        <Polyline
          key={`altitude-${waypoint.id}-${nextWaypoint.id}`}
          coordinates={[
            {
              latitude: waypoint.coordinates.latitude,
              longitude: waypoint.coordinates.longitude,
            },
            {
              latitude: nextWaypoint.coordinates.latitude,
              longitude: nextWaypoint.coordinates.longitude,
            },
          ]}
          strokeWidth={4}
          strokeColor={color}
          zIndex={1}
        />
      );
    });
  };

  return (
    <>
      {/* Base path */}
      <Polyline
        coordinates={coordinates}
        {...getPathStyle()}
        zIndex={0}
      />

      {/* Altitude gradient overlay */}
      {renderAltitudeGradient()}
    </>
  );
};