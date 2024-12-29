// Button.tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'critical';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  children,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  size = 'md'
}) => {
  const getVariantStyles = () => {
    const baseStyle = 'rounded-lg flex-row items-center justify-center';
    const sizeStyles = {
      sm: 'px-3 py-1.5',
      md: 'px-4 py-2',
      lg: 'px-6 py-3'
    };

    const variants = {
      primary: `${baseStyle} ${sizeStyles[size]} bg-blue-600 active:bg-blue-700`,
      secondary: `${baseStyle} ${sizeStyles[size]} bg-gray-200 active:bg-gray-300`,
      danger: `${baseStyle} ${sizeStyles[size]} bg-red-600 active:bg-red-700`,
      warning: `${baseStyle} ${sizeStyles[size]} bg-yellow-500 active:bg-yellow-600`,
      critical: `${baseStyle} ${sizeStyles[size]} bg-red-700 active:bg-red-800`
    };

    return `${variants[variant]} ${disabled ? 'opacity-50' : ''} ${fullWidth ? 'w-full' : ''}`;
  };

  const getTextColor = () => {
    const colors = {
      primary: 'text-white',
      secondary: 'text-gray-800',
      danger: 'text-white',
      warning: 'text-white',
      critical: 'text-white'
    };
    return colors[variant];
  };

  const getTextSize = () => {
    const sizes = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg'
    };
    return sizes[size];
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={getVariantStyles()}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'secondary' ? '#1F2937' : '#FFFFFF'}
        />
      ) : (
        <Text className={`font-semibold ${getTextColor()} ${getTextSize()}`}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};