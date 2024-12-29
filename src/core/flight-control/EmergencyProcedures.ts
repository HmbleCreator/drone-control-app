// src/core/flight-control/EmergencyProcedures.ts

export interface EmergencyProcedure {
    type: 'land' | 'return_home' | 'hover'; // Define possible emergency types
    description?: string; // Optional description for additional context
  }
  
  export interface EmergencyProcedures {
    procedures: EmergencyProcedure[];
  }  