// types/mission.ts
export type Coordinates = {
  latitude: number;
  longitude: number;
  altitude?: number;
};

export type WaypointType =
  | 'takeoff'
  | 'landing'
  | 'photo'
  | 'video'
  | 'hover'
  | 'speed_change'
  | 'altitude_change';

export type Waypoint = {
  id: string;
  type: WaypointType;
  coordinates: Coordinates;
  heading?: number;
  speed?: number;
  hoverTime?: number; // in seconds
  // Action specific parameters
  actionParams?: {
    photoInterval?: number;
    videoLength?: number;
    targetAltitude?: number;
    targetSpeed?: number;
  };
};

export enum WaypointAction {
  TAKEOFF = 'TAKEOFF',
  LAND = 'LAND',
  TAKE_PHOTO = 'TAKE_PHOTO',
  RECORD_VIDEO = 'RECORD_VIDEO',
  HOVER = 'HOVER',
  ADJUST_SPEED = 'ADJUST_SPEED',
  ADJUST_ALTITUDE = 'ADJUST_ALTITUDE',
  RETURN_HOME = 'RETURN_HOME'
}

export const WaypointTypeToAction: Record<WaypointType, WaypointAction> = {
  takeoff: WaypointAction.TAKEOFF,
  landing: WaypointAction.LAND,
  photo: WaypointAction.TAKE_PHOTO,
  video: WaypointAction.RECORD_VIDEO,
  hover: WaypointAction.HOVER,
  speed_change: WaypointAction.ADJUST_SPEED,
  altitude_change: WaypointAction.ADJUST_ALTITUDE
};

export enum MissionStatus {
  DRAFT = 'DRAFT',
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ABORTED = 'ABORTED',
  FAILED = 'FAILED'
}

export interface MissionSettings {
  maxAltitude: number;
  maxSpeed: number;
  returnToHomeAltitude: number;
  emergencyLandingPoints: Coordinates[];
  geofence?: GeofenceConfig;
}

export interface GeofenceConfig {
  boundaries: Coordinates[];
  maxAltitude: number;
  minAltitude: number;
}

export interface Mission {
  id: string;
  name: string;
  description?: string;
  waypoints: Waypoint[];
  createdAt: number;
  updatedAt: number;
  status: MissionStatus;
  settings: MissionSettings;
}

export interface MissionProgress {
  missionId: string;
  currentWaypointIndex: number;
  completedWaypoints: string[];
  distanceRemaining: number;
  estimatedTimeRemaining: number;
  batteryRequiredForReturn: number;
}