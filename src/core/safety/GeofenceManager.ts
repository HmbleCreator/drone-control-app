// src/core/safety/GeofenceManager.ts
interface Coordinates {
    latitude: number;
    longitude: number;
    altitude?: number;
}

export class GeofenceManager {
    private homePosition: Coordinates | null = null;
    private readonly MAX_DISTANCE_FROM_HOME = 1000; // meters
    private readonly MAX_ALTITUDE = 120; // meters

    public setHomePosition(position: Coordinates): void {
        this.homePosition = position;
    }

    public checkPosition(position: Coordinates): boolean {
        if (!this.homePosition) return true;

        const distance = this.calculateDistanceToHome(position);
        const isWithinRadius = distance <= this.MAX_DISTANCE_FROM_HOME;
        const isWithinAltitude = position.altitude ? position.altitude <= this.MAX_ALTITUDE : true;

        return isWithinRadius && isWithinAltitude;
    }

    public calculateDistanceToHome(position: Coordinates): number {
        if (!this.homePosition) return 0;

        const R = 6371e3; // Earth's radius in meters
        const φ1 = this.toRadians(this.homePosition.latitude);
        const φ2 = this.toRadians(position.latitude);
        const Δφ = this.toRadians(position.latitude - this.homePosition.latitude);
        const Δλ = this.toRadians(position.longitude - this.homePosition.longitude);

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                 Math.cos(φ1) * Math.cos(φ2) *
                 Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c;
    }

    private toRadians(degrees: number): number {
        return degrees * Math.PI / 180;
    }
}