import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CATEGORIES } from '../data/mockReports';

interface CategoryBadgeProps {
  category: keyof typeof CATEGORIES;
  size?: 'small' | 'medium' | 'large';
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ 
  category, 
  size = 'medium' 
}) => {
  const config = CATEGORIES[category];
  const sizeStyles = {
    small: { width: 32, height: 32, fontSize: 16 },
    medium: { width: 40, height: 40, fontSize: 20 },
    large: { width: 48, height: 48, fontSize: 24 }
  };

  return (
    <View style={[
      styles.badge, 
      { 
        backgroundColor: config.color,
        width: sizeStyles[size].width,
        height: sizeStyles[size].height
      }
    ]}>
      <Text style={[styles.icon, { fontSize: sizeStyles[size].fontSize }]}>
        {config.icon}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    textAlign: 'center',
  }
});