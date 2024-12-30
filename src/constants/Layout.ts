// layout.ts
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const LAYOUT = {
  // Screen Dimensions
  window: {
    width,
    height,
  },

  // Responsive Breakpoints
  breakpoints: {
    phone: 0,
    tablet: 768,
    desktop: 1024,
  },

  // Navigation
  navigation: {
    headerHeight: 56,
    bottomTabHeight: 64,
    drawerWidth: 300,
  },

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Border Radius
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  // Component Sizes
  components: {
    button: {
      sm: {
        height: 32,
        paddingHorizontal: 12,
      },
      md: {
        height: 40,
        paddingHorizontal: 16,
      },
      lg: {
        height: 48,
        paddingHorizontal: 20,
      },
    },
    input: {
      sm: 32,
      md: 40,
      lg: 48,
    },
    icon: {
      sm: 16,
      md: 24,
      lg: 32,
    },
  },

  // Map
  map: {
    defaultZoom: 15,
    clusterThreshold: 100,
    waypointSize: 32,
  },

  // Flight Controls
  flight: {
    attitudeIndicatorSize: 200,
    telemetryGaugeHeight: 80,
    minimumTouchTarget: 44,
  },
};