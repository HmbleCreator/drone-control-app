// src/core/mission-execution/MissionManager.ts
import { Mission, Waypoint, MissionProgress } from '../../types/mission';
import { MissionExecutor } from './MissionExecutor';

type ProgressCallback = (progress: MissionProgress) => void;
type Subscription = { unsubscribe: () => void };

class MissionManager {
// Add this to MissionManager class
  public currentMission: Mission | null = null;
  private missionExecutor: MissionExecutor;
  private progressSubscribers: Set<ProgressCallback>;

  constructor() {
    this.missionExecutor = new MissionExecutor();
    this.progressSubscribers = new Set();

    // Subscribe to executor progress updates
    this.missionExecutor.onProgress((progress: MissionProgress) => {
      this.notifyProgressSubscribers(progress);
    });
  }

  public async loadMission(missionId: string): Promise<Mission> {
    try {
      const response = await fetch(`/api/missions/${missionId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const mission = await response.json();
      this.currentMission = mission;
      return mission;
    } catch (error) {
      throw new Error(`Failed to load mission: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public subscribeToProgress(callback: ProgressCallback): Subscription {
    this.progressSubscribers.add(callback);
    return {
      unsubscribe: () => {
        this.progressSubscribers.delete(callback);
      }
    };
  }

  private notifyProgressSubscribers(progress: MissionProgress): void {
    this.progressSubscribers.forEach(subscriber => subscriber(progress));
  }

  public async updateMission(missionId: string, updates: Partial<Mission>): Promise<Mission> {
    try {
      const response = await fetch(`/api/missions/${missionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedMission = await response.json();
      if (this.currentMission?.id === missionId) {
        this.currentMission = updatedMission;
      }
      return updatedMission;
    } catch (error) {
      throw new Error(`Failed to update mission: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async addWaypoint(missionId: string, waypoint: Omit<Waypoint, 'id'>): Promise<Mission> {
    try {
      const response = await fetch(`/api/missions/${missionId}/waypoints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(waypoint)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedMission = await response.json();
      if (this.currentMission?.id === missionId) {
        this.currentMission = updatedMission;
      }
      return updatedMission;
    } catch (error) {
      throw new Error(`Failed to add waypoint: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async startCurrentMission(): Promise<void> {
    if (!this.currentMission) {
      throw new Error("No current mission to start.");
    }
    await this.missionExecutor.startMission(this.currentMission);
  }

  public async pauseCurrentMission(): Promise<void> {
    if (!this.currentMission) {
      throw new Error("No current mission to pause.");
    }
    await this.missionExecutor.pauseMission();
  }

  public async resumeCurrentMission(): Promise<void> {
    if (!this.currentMission) {
      throw new Error("No current mission to resume.");
    }
    await this.missionExecutor.resumeMission();
  }

  public async abortCurrentMission(): Promise<void> {
    if (!this.currentMission) {
      throw new Error("No current mission to abort.");
    }
    await this.missionExecutor.abortMission();
  }

  public getCurrentStatus(): MissionProgress | null {
    return this.missionExecutor.getCurrentStatus();
  }

  public getTargetAltitude(): number {
    if (!this.currentMission?.waypoints?.length) {
      return 0;
    }
    return this.currentMission.waypoints[0].coordinates.altitude ?? 0;
  }
}

export { MissionManager };