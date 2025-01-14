import { eventBus } from "./eventBus";

// errorHandling.ts
export type ErrorSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export class DroneError extends Error {
  constructor(
    message: string,
    public code: string,
    public severity: ErrorSeverity
  ) {
    super(message);
    this.name = 'DroneError';
  }
}

export const errorHandler = {
  log: (error: DroneError) => {
    console.error(`[${error.severity}] ${error.code}: ${error.message}`);
    eventBus.publish('error', error);
  },
  
  handle: (error: DroneError) => {
    errorHandler.log(error);
    if (error.severity === 'CRITICAL') {
      eventBus.publish('emergency', error);
    }
  }
};