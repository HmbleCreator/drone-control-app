// src/core/mission-execution/MissionExecutor.ts

import { Mission, MissionTask, MissionStatus, Waypoint } from './MissionModels';

class MissionExecutor {
  
  private currentMission: Mission | null = null;
  private currentTaskIndex: number = 0;

  public async startMission(mission: Mission): Promise<void> {
    this.currentMission = mission;
    this.currentTaskIndex = 0;

    console.log(`Starting mission: ${mission.name}`);
    
    while (this.currentTaskIndex < mission.waypoints.length) {
      const waypoint = mission.waypoints[this.currentTaskIndex];
      await this.executeWaypoint(waypoint);
      this.currentTaskIndex++;
    }

    console.log(`Mission ${mission.name} completed.`);
  }

  private async executeWaypoint(waypoint: Waypoint): Promise<void> {
    console.log(`Navigating to waypoint at Latitude: ${waypoint.latitude}, Longitude: ${waypoint.longitude}, Altitude: ${waypoint.altitude}`);
    
    // Simulate navigation logic here
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate time taken to navigate

    console.log(`Reached waypoint at Latitude: ${waypoint.latitude}, Longitude: ${waypoint.longitude}`);
    
    // You can implement additional logic for tasks at each waypoint here
  }

  public getCurrentStatus(): MissionStatus | null {
    if (!this.currentMission) return null;

    return {
      missionId: this.currentMission.id,
      currentTaskIndex: this.currentTaskIndex,
      isCompleted: this.currentTaskIndex >= this.currentMission.waypoints.length,
    };
  }
}

export default MissionExecutor;
