// src/core/mission-execution/ValidationEngine.ts
import { Mission, Waypoint, ValidationError, ValidationResult } from './MissionModels';

export class ValidationEngine {
  public validateMission(mission: Mission): ValidationResult {
    const results: ValidationError[] = [];
    
    this.validateWaypoints(mission.waypoints, results);
    this.validateMissionParameters(mission, results);
    
    return {
      isValid: results.length === 0,
      errors: results
    };
  }

  private validateWaypoints(waypoints: Waypoint[], results: ValidationError[]): void {
    if (waypoints.length === 0) {
      results.push({
        code: 'NO_WAYPOINTS',
        message: 'Mission must have at least one waypoint'
      });
    }

    waypoints.forEach((waypoint, index) => {
      if (waypoint.altitude > 400) {
        results.push({
          code: 'ALTITUDE_EXCEEDED',
          message: `Waypoint ${index} exceeds maximum altitude`
        });
      }
    });
  }

  private validateMissionParameters(mission: Mission, results: ValidationError[]): void {
    // Add mission-specific validation logic
  }
}