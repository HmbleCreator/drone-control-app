// Card.tsx
import React from 'react';
import { View } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'bordered';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default'
}) => {
  const getVariantStyles = () => {
    const variants = {
      default: 'bg-white rounded-lg shadow-sm',
      elevated: 'bg-white rounded-lg shadow-lg',
      bordered: 'bg-white rounded-lg border border-gray-200'
    };
    return variants[variant];
  };

  return (
    <View className={`${getVariantStyles()} ${className}`}>
      {children}
    </View>
  );
};