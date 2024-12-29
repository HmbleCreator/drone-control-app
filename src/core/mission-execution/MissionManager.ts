// src/core/mission-execution/MissionManager.ts

import { Mission, Waypoint } from './MissionModels';
import MissionPlanner from './MissionPlanner';
import MissionExecutor from './MissionExecutor';

class MissionManager {
  private currentMission: Mission | null = null;
  private missionExecutor: MissionExecutor;

  constructor() {
    this.missionExecutor = new MissionExecutor();
  }

  public createMission(name: string, waypoints: Waypoint[]): Mission {
    const planner = new MissionPlanner();
    const mission = planner.createMission(name, waypoints);
    this.currentMission = mission;
    return mission;
  }

  public async startCurrentMission(): Promise<void> {
    if (this.currentMission) {
      await this.missionExecutor.startMission(this.currentMission);
    } else {
      console.error("No current mission to start.");
    }
  }

  public async pauseCurrentMission(): Promise<void> {
    console.log("Pausing current mission...");
    // Implement actual pause logic in MissionExecutor if needed
  }

  public async resumeCurrentMission(): Promise<void> {
    console.log("Resuming current mission...");
    // Implement actual resume logic in MissionExecutor if needed
  }

  public async abortCurrentMission(): Promise<void> {
    console.log("Aborting current mission...");
    // Implement actual abort logic in MissionExecutor if needed
  }

  public getCurrentStatus() {
    return this.missionExecutor.getCurrentStatus();
  }

  // New method to get target altitude
  public getTargetAltitude(): number {
    if (this.currentMission && this.currentMission.waypoints.length > 0) {
      // Assuming the target altitude is the altitude of the first waypoint
      return this.currentMission.waypoints[0].altitude;
    }
    return 0; // Default value if no mission or waypoints are available
  }
}

export default MissionManager;