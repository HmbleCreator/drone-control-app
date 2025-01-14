// hooks/useMission.ts
import { useState, useEffect, useCallback } from 'react';
import { Mission, Waypoint, MissionProgress } from '../types/mission';
import { MissionManager } from '../core/mission-execution/MissionManager';

export const useMission = (missionId?: string) => {
  const [mission, setMission] = useState<Mission | null>(null);
  const [progress, setProgress] = useState<MissionProgress | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!missionId) return;

    const missionManager = new MissionManager();
    let mounted = true;

    const loadMission = async () => {
      setIsLoading(true);
      try {
        const missionData = await missionManager.loadMission(missionId);
        if (mounted) {
          setMission(missionData);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to load mission'));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadMission();

    const progressSubscription = missionManager.subscribeToProgress((missionProgress: MissionProgress) => {
      if (mounted) {
        setProgress(missionProgress);
      }
    });

    return () => {
      mounted = false;
      progressSubscription.unsubscribe();
    };
  }, [missionId]);

  const updateMission = useCallback(async (updates: Partial<Mission>) => {
    if (!mission) return;

    const missionManager = new MissionManager();
    try {
      const updatedMission = await missionManager.updateMission(mission.id, updates);
      setMission(updatedMission);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update mission'));
    }
  }, [mission]);

  const addWaypoint = useCallback(async (waypoint: Omit<Waypoint, 'id'>) => {
    if (!mission) return;

    const missionManager = new MissionManager();
    try {
      const updatedMission = await missionManager.addWaypoint(mission.id, waypoint);
      setMission(updatedMission);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add waypoint'));
    }
  }, [mission]);

  return {
    mission,
    progress,
    error,
    isLoading,
    updateMission,
    addWaypoint
  };
};

export default useMission;