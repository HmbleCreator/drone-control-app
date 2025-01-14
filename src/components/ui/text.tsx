// src/components/ui/text.tsx
import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';

interface TextProps extends RNTextProps {
  variant?: 'default' | 'heading' | 'subheading' | 'caption';
  children: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({
  variant = 'default',
  style,
  children,
  ...props
}) => {
  const getVariantStyles = () => {
    const variants = {
      default: {
        fontSize: 14,
        color: '#374151'
      },
      heading: {
        fontSize: 24,
        fontWeight: '600',
        color: '#111827'
      },
      subheading: {
        fontSize: 18,
        fontWeight: '500',
        color: '#1F2937'
      },
      caption: {
        fontSize: 12,
        color: '#6B7280'
      }
    };
    return variants[variant];
  };

  return (
    <RNText style={[getVariantStyles(), style]} {...props}>
      {children}
    </RNText>
  );
};