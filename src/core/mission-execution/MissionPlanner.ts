// src/core/mission-execution/MissionPlanner.ts

import { Mission, Waypoint } from './MissionModels';

class MissionPlanner {
  
  public createMission(name: string, waypoints: Waypoint[]): Mission {
    const missionId = this.generateMissionId();
    const mission: Mission = {
      id: missionId,
      name,
      waypoints,
    };

    console.log(`Mission created: ${mission.name} with ID ${mission.id}`);
    return mission;
  }

  private generateMissionId(): string {
    return 'mission-' + Math.random().toString(36).substr(2, 9); // Simple ID generation
  }
}

export default MissionPlanner;