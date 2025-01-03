// src/core/mission-execution/MissionExecutor.ts
import { Mission, MissionProgress, Waypoint, MissionStatus, WaypointAction,  WaypointTypeToAction} from '../../types/mission';

type ProgressCallback = (progress: MissionProgress) => void;

export class MissionExecutor {
  private currentMission: Mission | null = null;
  private currentWaypointIndex: number = 0;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private progressSubscribers: Set<ProgressCallback> = new Set();
  private completedWaypoints: string[] = [];

  public onProgress(callback: ProgressCallback): { unsubscribe: () => void } {
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

  public async startMission(mission: Mission): Promise<void> {
    if (mission.status === MissionStatus.IN_PROGRESS) {
      throw new Error('Mission is already in progress');
    }

    this.currentMission = mission;
    this.currentWaypointIndex = 0;
    this.isRunning = true;
    this.isPaused = false;
    this.completedWaypoints = [];
    
    // Update mission status
    mission.status = MissionStatus.IN_PROGRESS;
    console.log(`Starting mission: ${mission.name}`);

    try {
      while (this.isRunning && this.currentWaypointIndex < mission.waypoints.length) {
        if (!this.isPaused) {
          const waypoint = mission.waypoints[this.currentWaypointIndex];
          await this.executeWaypoint(waypoint);
          this.completedWaypoints.push(waypoint.id);
          this.currentWaypointIndex++;
          this.notifyProgressSubscribers(this.calculateProgress());
        } else {
          await new Promise(resolve => setTimeout(resolve, 100)); // Check pause state periodically
        }
      }

      if (this.isRunning) {
        mission.status = MissionStatus.COMPLETED;
        console.log(`Mission ${mission.name} completed successfully.`);
      }
    } catch (error) {
      mission.status = MissionStatus.FAILED;
      console.error(`Mission ${mission.name} failed:`, error);
      throw error;
    }
  }

  public async pauseMission(): Promise<void> {
    if (!this.currentMission || !this.isRunning) {
      throw new Error('No active mission to pause');
    }
    this.isPaused = true;
    console.log('Mission paused');
  }

  public async resumeMission(): Promise<void> {
    if (!this.currentMission || !this.isRunning) {
      throw new Error('No active mission to resume');
    }
    this.isPaused = false;
    console.log('Mission resumed');
  }

  public async abortMission(): Promise<void> {
    if (!this.currentMission) {
      throw new Error('No active mission to abort');
    }
    this.isRunning = false;
    this.currentMission.status = MissionStatus.ABORTED;
    console.log('Mission aborted');
  }

  private async executeWaypoint(waypoint: Waypoint): Promise<void> {
    console.log(`Executing waypoint ${waypoint.id} of type ${waypoint.type}`);
    
    const action = WaypointTypeToAction[waypoint.type];
    
    // Validate waypoint against mission settings if needed
    if (this.currentMission) {
      this.validateWaypoint(waypoint, this.currentMission);
    }

    switch (action) {
      case WaypointAction.TAKEOFF:
        await this.executeTakeoff(waypoint);
        break;
      case WaypointAction.LAND:
        await this.executeLanding(waypoint);
        break;
      case WaypointAction.TAKE_PHOTO:
        await this.executePhotoCapture(waypoint);
        break;
      case WaypointAction.RECORD_VIDEO:
        await this.executeVideoRecording(waypoint);
        break;
      case WaypointAction.HOVER:
        await this.executeHover(waypoint);
        break;
      case WaypointAction.ADJUST_SPEED:
        await this.executeSpeedChange(waypoint);
        break;
      case WaypointAction.ADJUST_ALTITUDE:
        await this.executeAltitudeChange(waypoint);
        break;
      default:
        throw new Error(`Unknown waypoint action: ${action}`);
    }
  }

  private validateWaypoint(waypoint: Waypoint, mission: Mission): void {
    const { maxAltitude, maxSpeed } = mission.settings;
    
    if (waypoint.coordinates.altitude && waypoint.coordinates.altitude > maxAltitude) {
      throw new Error(`Waypoint altitude ${waypoint.coordinates.altitude} exceeds maximum allowed altitude ${maxAltitude}`);
    }
    
    if (waypoint.speed && waypoint.speed > maxSpeed) {
      throw new Error(`Waypoint speed ${waypoint.speed} exceeds maximum allowed speed ${maxSpeed}`);
    }
  }

  // Implement specific waypoint execution methods
  private async executeTakeoff(waypoint: Waypoint): Promise<void> {
    console.log(`Executing takeoff to altitude: ${waypoint.coordinates.altitude}`);
    await this.simulateAction(2000);
  }

  private async executeLanding(waypoint: Waypoint): Promise<void> {
    console.log('Executing landing sequence');
    await this.simulateAction(3000);
  }

  private async executePhotoCapture(waypoint: Waypoint): Promise<void> {
    console.log('Capturing photo');
    await this.simulateAction(1000);
  }

  private async executeVideoRecording(waypoint: Waypoint): Promise<void> {
    const duration = waypoint.actionParams?.videoLength ?? 5;
    console.log(`Recording video for ${duration} seconds`);
    await this.simulateAction(duration * 1000);
  }

  private async executeHover(waypoint: Waypoint): Promise<void> {
    const duration = waypoint.hoverTime ?? 5;
    console.log(`Hovering for ${duration} seconds`);
    await this.simulateAction(duration * 1000);
  }

  private async executeSpeedChange(waypoint: Waypoint): Promise<void> {
    console.log(`Adjusting speed to: ${waypoint.speed}`);
    await this.simulateAction(1000);
  }

  private async executeAltitudeChange(waypoint: Waypoint): Promise<void> {
    console.log(`Adjusting altitude to: ${waypoint.coordinates.altitude}`);
    await this.simulateAction(2000);
  }

  private async simulateAction(duration: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, duration));
  }

  public getCurrentStatus(): MissionProgress | null {
    if (!this.currentMission) return null;
    return this.calculateProgress();
  }

  private calculateProgress(): MissionProgress {
    if (!this.currentMission) {
      throw new Error('No active mission');
    }

    const totalWaypoints = this.currentMission.waypoints.length;
    const remainingWaypoints = totalWaypoints - this.currentWaypointIndex;
    
    // These calculations are simplified - implement actual logic based on your needs
    const distanceRemaining = this.calculateRemainingDistance();
    const estimatedTimeRemaining = this.calculateEstimatedTime(distanceRemaining);
    const batteryRequiredForReturn = this.calculateRequiredBattery(distanceRemaining);

    return {
      missionId: this.currentMission.id,
      currentWaypointIndex: this.currentWaypointIndex,
      completedWaypoints: this.completedWaypoints,
      distanceRemaining,
      estimatedTimeRemaining,
      batteryRequiredForReturn
    };
  }

  private calculateRemainingDistance(): number {
    if (!this.currentMission) {
      return 0;
    }

    const remainingWaypoints = this.currentMission.waypoints.slice(this.currentWaypointIndex);
    let totalDistance = 0;

    // Calculate 3D distance between consecutive waypoints
    for (let i = 0; i < remainingWaypoints.length - 1; i++) {
      const current = remainingWaypoints[i].coordinates;
      const next = remainingWaypoints[i + 1].coordinates;

      // Convert lat/long to meters using Haversine formula
      const R = 6371000; // Earth's radius in meters
      const φ1 = this.toRadians(current.latitude);
      const φ2 = this.toRadians(next.latitude);
      const Δφ = this.toRadians(next.latitude - current.latitude);
      const Δλ = this.toRadians(next.longitude - current.longitude);

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      // Calculate horizontal distance
      const horizontalDistance = R * c;

      // Calculate vertical distance (altitude difference)
      const verticalDistance = Math.abs((next.altitude ?? 0) - (current.altitude ?? 0));

      // Calculate 3D distance using Pythagorean theorem
      const distance3D = Math.sqrt(
        Math.pow(horizontalDistance, 2) + Math.pow(verticalDistance, 2)
      );

      totalDistance += distance3D;
    }

    return totalDistance;
  }

  private calculateEstimatedTime(distance: number): number {
    if (!this.currentMission) {
      return 0;
    }

    let totalTime = 0;
    const remainingWaypoints = this.currentMission.waypoints.slice(this.currentWaypointIndex);

    // Add time for remaining waypoints
    for (const waypoint of remainingWaypoints) {
      // Add time for waypoint-specific actions
      switch (waypoint.type) {
        case 'hover':
          totalTime += waypoint.hoverTime ?? 0;
          break;
        case 'photo':
          totalTime += 2; // Assuming 2 seconds for photo capture
          break;
        case 'video':
          totalTime += waypoint.actionParams?.videoLength ?? 0;
          break;
        case 'takeoff':
        case 'landing':
          totalTime += 30; // Assuming 30 seconds for takeoff/landing
          break;
      }
    }

    // Calculate travel time based on distance and speed
    const averageSpeed = this.calculateAverageSpeed(remainingWaypoints);
    const travelTime = distance / averageSpeed;

    // Add 10% buffer for environmental factors and maneuvering
    return (totalTime + travelTime) * 1.1;
  }

  private calculateRequiredBattery(distance: number): number {
    if (!this.currentMission) {
      return 0;
    }

    // Base battery consumption per meter (percentage)
    const BASE_CONSUMPTION_PER_METER = 0.001;

    // Additional consumption factors
    const HOVER_CONSUMPTION_PER_SECOND = 0.05;
    const PHOTO_CONSUMPTION = 0.1;
    const VIDEO_CONSUMPTION_PER_SECOND = 0.08;
    const ALTITUDE_CHANGE_FACTOR = 0.002;

    let totalConsumption = 0;
    const remainingWaypoints = this.currentMission.waypoints.slice(this.currentWaypointIndex);

    // Calculate distance-based consumption
    totalConsumption += distance * BASE_CONSUMPTION_PER_METER;

    // Add consumption for specific actions
    for (const waypoint of remainingWaypoints) {
      switch (waypoint.type) {
        case 'hover':
          totalConsumption += (waypoint.hoverTime ?? 0) * HOVER_CONSUMPTION_PER_SECOND;
          break;
        case 'photo':
          totalConsumption += PHOTO_CONSUMPTION;
          break;
        case 'video':
          totalConsumption += (waypoint.actionParams?.videoLength ?? 0) * VIDEO_CONSUMPTION_PER_SECOND;
          break;
        case 'altitude_change':
          const altitudeChange = Math.abs(
            (waypoint.actionParams?.targetAltitude ?? 0) - 
            (waypoint.coordinates.altitude ?? 0)
          );
          totalConsumption += altitudeChange * ALTITUDE_CHANGE_FACTOR;
          break;
      }
    }

    // Add wind resistance factor (simplified)
    totalConsumption *= 1.2;

    // Add safety margin for return journey (50% extra)
    totalConsumption *= 1.5;

    return totalConsumption;
  }

  // Helper methods
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private calculateAverageSpeed(waypoints: Waypoint[]): number {
    const speeds = waypoints
      .map(w => w.speed)
      .filter((speed): speed is number => speed !== undefined);

    if (speeds.length === 0) {
      return this.currentMission?.settings.maxSpeed ?? 10; // Default speed in m/s
    }

    return speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length;
  }
}