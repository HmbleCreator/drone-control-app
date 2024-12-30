// permissions.ts
import { Platform, PermissionsAndroid } from 'react-native';
import type { Permission, PermissionStatus } from 'react-native';

// Define our permission types
export type DronePermission = 
  | 'camera'
  | 'location'
  | 'bluetooth'
  | 'storage'
  | 'microphone';

// Define the results type
export type PermissionResults = Record<DronePermission, PermissionStatus>;

// Map our permission types to platform-specific permissions
const ANDROID_PERMISSIONS: Record<DronePermission, Permission> = {
  camera: PermissionsAndroid.PERMISSIONS.CAMERA,
  location: PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  bluetooth: PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
  storage: PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  microphone: PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
};

// Helper function to request a single permission
const requestPermission = async (permission: DronePermission): Promise<PermissionStatus> => {
  try {
    if (Platform.OS === 'android') {
      const status = await PermissionsAndroid.check(ANDROID_PERMISSIONS[permission]);
      if (status) {
        return 'granted';
      }
      
      const result = await PermissionsAndroid.request(
        ANDROID_PERMISSIONS[permission],
        {
          title: `Drone Control Permission`,
          message: `We need ${permission} permission for drone control`,
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      
      return result;
    } else {
      // For iOS, you would use different permission APIs
      // This is a placeholder for iOS implementation
      console.warn('iOS permissions not implemented');
      return 'denied';
    }
  } catch (error) {
    console.error(`Error requesting ${permission} permission:`, error);
    return 'denied';
  }
};

// Main permissions request function
export const requestPermissions = async (): Promise<PermissionResults> => {
  const permissions: DronePermission[] = [
    'camera',
    'location',
    'bluetooth',
    'storage',
    'microphone'
  ];
  
  const results = {} as PermissionResults;
  
  for (const permission of permissions) {
    results[permission] = await requestPermission(permission);
  }
  
  return results;
};

// Usage example
export const checkAndRequestPermissions = async () => {
  try {
    const permissions = await requestPermissions();
    const hasAllPermissions = Object.values(permissions).every(
      status => status === 'granted'
    );
    
    return hasAllPermissions;
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
};