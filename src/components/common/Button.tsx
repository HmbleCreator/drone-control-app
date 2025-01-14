// src/components/common/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, StyleProp, TextStyle } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'critical' | 'default' | 'destructive';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  children,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  size = 'md',
  style,
  textStyle
}) => {
  const getBaseStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: size === 'sm' ? 8 : size === 'md' ? 12 : 16
    };

    const variants: Record<string, ViewStyle> = {
      primary: { backgroundColor: '#3B82F6' },
      secondary: { backgroundColor: '#E5E7EB' },
      danger: { backgroundColor: '#EF4444' },
      warning: { backgroundColor: '#F59E0B' },
      critical: { backgroundColor: '#DC2626' },
      default: { backgroundColor: '#3B82F6' },
      destructive: { backgroundColor: '#DC2626' }
    };

    return {
      ...baseStyle,
      ...variants[variant],
      opacity: disabled ? 0.5 : 1,
      width: fullWidth ? '100%' : undefined
    };
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[getBaseStyles(), style]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'secondary' ? '#1F2937' : '#FFFFFF'}
        />
      ) : (
        typeof children === 'string' ? (
          <Text
            style={[
              {
                color: variant === 'secondary' ? '#1F2937' : '#FFFFFF',
                fontWeight: '600',
                fontSize: size === 'sm' ? 14 : size === 'md' ? 16 : 18
              },
              textStyle
            ]}
          >
            {children}
          </Text>
        ) : (
          children
        )
      )}
    </TouchableOpacity>
  );
};