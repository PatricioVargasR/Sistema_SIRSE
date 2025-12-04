// hooks/useReportPolling.ts
import { useEffect, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useLocation } from './useLocation';
import { ReportPollingService } from '@/services/reportPollingService';
import { Report } from '@/config/config_types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const POLLING_ENABLED_KEY = '@sirse_polling_enabled';
const POLLING_INTERVAL_KEY = '@sirse_polling_interval';

interface PollingConfig {
  interval: number; // en milisegundos
  radius: number; // en km
  enabled: boolean;
}

const DEFAULT_CONFIG: PollingConfig = {
  interval: 2 * 60 * 1000, // 2 minutos
  radius: 5, // 5 km
  enabled: true
};

export const useReportPolling = () => {
  const { location } = useLocation(true);
  const [isActive, setIsActive] = useState(false);
  const [newReportsCount, setNewReportsCount] = useState(0);
  const [config, setConfig] = useState<PollingConfig>(DEFAULT_CONFIG);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Cargar configuración guardada
  useEffect(() => {
    loadConfig();
  }, []);

  // Iniciar/detener polling según la ubicación y configuración
  useEffect(() => {
    if (!location || !config.enabled) {
      if (isActive) {
        stopPolling();
      }
      return;
    }

    startPolling();

    return () => {
      stopPolling();
    };
  }, [location, config.enabled, config.interval]);

  // Manejar cambios de estado de la app (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [isActive, config.enabled]);

  const loadConfig = async () => {
    try {
      const enabledStr = await AsyncStorage.getItem(POLLING_ENABLED_KEY);
      const intervalStr = await AsyncStorage.getItem(POLLING_INTERVAL_KEY);

      const enabled = enabledStr ? JSON.parse(enabledStr) : DEFAULT_CONFIG.enabled;
      const interval = intervalStr ? parseInt(intervalStr) : DEFAULT_CONFIG.interval;

      setConfig(prev => ({
        ...prev,
        enabled,
        interval
      }));
    } catch (error) {
      console.error('Error cargando configuración:', error);
    }
  };

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active' && config.enabled && location) {
      // App vuelve a primer plano
      console.log('📱 App en primer plano - reiniciando polling');
      startPolling();
    } else if (nextAppState.match(/inactive|background/)) {
      // App va a segundo plano
      console.log('📱 App en segundo plano - pausando polling');
      stopPolling();
    }
  };

  const startPolling = async () => {
    if (!location) {
      console.log('❌ No se puede iniciar polling sin ubicación');
      return;
    }

    try {
      await ReportPollingService.initialize(location);
      
      await ReportPollingService.startPolling(
        location,
        handleNewReports,
        config.interval
      );

      setIsActive(true);
      console.log('✅ Polling iniciado');
    } catch (error) {
      console.error('Error iniciando polling:', error);
    }
  };

  const stopPolling = () => {
    ReportPollingService.stopPolling();
    setIsActive(false);
  };

  const handleNewReports = useCallback((reports: Report[]) => {
    console.log(`🆕 ${reports.length} reportes nuevos detectados`);
    setNewReportsCount(prev => prev + reports.length);
    setLastUpdate(new Date());
  }, []);

  const togglePolling = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem(POLLING_ENABLED_KEY, JSON.stringify(enabled));
      setConfig(prev => ({ ...prev, enabled }));

      if (!enabled) {
        stopPolling();
      }
    } catch (error) {
      console.error('Error actualizando configuración:', error);
    }
  };

  const setPollingInterval = async (interval: number) => {
    try {
      await AsyncStorage.setItem(POLLING_INTERVAL_KEY, interval.toString());
      setConfig(prev => ({ ...prev, interval }));

      // Reiniciar polling con nuevo intervalo
      if (isActive && location) {
        stopPolling();
        setTimeout(() => startPolling(), 500);
      }
    } catch (error) {
      console.error('Error actualizando intervalo:', error);
    }
  };

  const clearNewReportsCount = () => {
    setNewReportsCount(0);
  };

  const checkNow = async () => {
    if (!location) return;

    console.log('🔍 Verificación manual de reportes...');
    await ReportPollingService.checkForNewReports(
      handleNewReports,
      config.radius
    );
  };

  const resetSeenReports = async () => {
    await ReportPollingService.clearSeenReports();
    setNewReportsCount(0);
    console.log('🔄 Reportes vistos reseteados');
  };

  const getStats = () => {
    return ReportPollingService.getStats();
  };

  return {
    isActive,
    config,
    newReportsCount,
    lastUpdate,
    togglePolling,
    setPollingInterval,
    clearNewReportsCount,
    checkNow,
    resetSeenReports,
    getStats
  };
};