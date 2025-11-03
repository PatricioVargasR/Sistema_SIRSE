import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: 'none', // Hide tab bar since we have custom navigation
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mapa',
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Reportes',
        }}
      />
    </Tabs>
  );
}