// src/core/flight-control/AttitudeEstimator.ts

class AttitudeEstimator {
  
    private roll: number = 0;
    private pitch: number = 0;
    private yaw: number = 0;
  
    public update(gyroData: { rollRate: number; pitchRate: number; yawRate: number }, dt: number): void {
      
      this.roll += gyroData.rollRate * dt;
      this.pitch += gyroData.pitchRate * dt;
      this.yaw += gyroData.yawRate * dt;
  
      console.log(`Updated Attitude - Roll: ${this.roll}, Pitch: ${this.pitch}, Yaw: ${this.yaw}`);
    }
  
    public getAttitude(): { roll: number; pitch: number; yaw: number } {
      
      return { roll: this.roll, pitch: this.pitch, yaw: this.yaw };
    }
  }
  
  export default AttitudeEstimator;
  