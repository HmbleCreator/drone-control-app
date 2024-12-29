// src/core/flight-control/PositionEstimator.ts

class PositionEstimator {

    private latitude: number = 0;
    private longitude: number = 0;
    
    public update(gpsData: { latitude: number; longitude: number }): void {
    
    this.latitude = gpsData.latitude;
    this.longitude = gpsData.longitude;
    
    console.log(`Updated Position - Latitude: ${this.latitude}, Longitude: ${this.longitude}`);
    }
    
    public getPosition(): { latitude: number; longitude: number } {
    
    return { latitude: this.latitude, longitude: this.longitude };
    }
    }
    
    export default PositionEstimator;
    