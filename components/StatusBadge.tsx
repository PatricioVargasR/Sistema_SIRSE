import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusBadgeProps {
  status: 'Urgente' | 'En proceso' | 'Pendiente';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusStyle = () => {
    switch(status) {
      case 'Urgente': 
        return { bg: '#FF5252', text: 'Urgente' };
      case 'En proceso': 
        return { bg: '#FF9800', text: 'En proceso' };
      default: 
        return { bg: '#9E9E9E', text: 'Pendiente' };
    }
  };
  
  const style = getStatusStyle();
  
  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text style={styles.text}>{style.text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  text: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  }
});