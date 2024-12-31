// src/core/mission-execution/MissionModels.ts

// Define types for mission-related data structures

export interface Mission {
    id: string;
    name: string;
    waypoints: Waypoint[];
  }
  
  export interface Waypoint {
    speed: number;
    latitude: number;
    longitude: number;
    altitude: number;
  }
  
  export interface MissionTask {
    id: string;
    type: string; // e.g., "navigate", "hover", "land"
    parameters: any; // Additional parameters specific to the task
  }
  
  export interface MissionStatus {
    missionId: string;
    currentTaskIndex: number;
    isCompleted: boolean;
  }

  export interface ValidationError {
    code: string;
    message: string;
    details?: any;  // Optional field for additional error information
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}