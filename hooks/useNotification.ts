// hooks/useNotifications.ts
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { NotificationService } from '@/services/notificationService';
import { useLocation } from './useLocation';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_STORAGE_KEY = '@sirse_notification_token';
const LOCATION_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutos

export const useNotifications = () => {
  const router = useRouter();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const { location } = useLocation(true);
  const locationUpdateTimer = useRef<number | null>(null);

  // Registrar dispositivo para notificaciones
  useEffect(() => {
    registerForNotifications();

    // Configurar listeners
    const cleanup = NotificationService.setupNotificationListeners(
      // Cuando llega una notificación (app abierta)
      (notification) => {
        console.log('📬 Notificación recibida:', notification);
        setNotification(notification);
      },
      // Cuando el usuario toca la notificación
      (response) => {
        console.log('👆 Notificación tocada:', response);
        const reportId = response.notification.request.content.data?.reportId;
        
        if (reportId) {
          router.push(`/report/${reportId}`);
        }
      }
    );

    return cleanup;
  }, []);

  // Actualizar ubicación periódicamente en el servidor
  useEffect(() => {
    if (!expoPushToken || !location || !isRegistered) return;

    // Actualizar inmediatamente
    updateLocation();

    // Actualizar cada 5 minutos
    locationUpdateTimer.current = setInterval(() => {
      updateLocation();
    }, LOCATION_UPDATE_INTERVAL);

    return () => {
      if (locationUpdateTimer.current) {
        clearInterval(locationUpdateTimer.current as any);
      }
    };
  }, [expoPushToken, location, isRegistered]);

  const registerForNotifications = async () => {
    try {
      // Intentar obtener token existente
      const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      
      // Registrar para push notifications
      const token = await NotificationService.registerForPushNotifications();
      
      if (!token) {
        console.log('❌ No se pudo obtener token de notificaciones');
        return;
      }

      setExpoPushToken(token);
      
      // Guardar token localmente
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);

      // Si hay ubicación, registrar en el servidor
      if (location) {
        const success = await NotificationService.saveTokenToServer(
          token,
          location.latitude,
          location.longitude
        );

        if (success) {
          setIsRegistered(true);
          console.log('✅ Notificaciones activadas correctamente');
        }
      }
    } catch (error) {
      console.error('Error registrando notificaciones:', error);
    }
  };

  const updateLocation = async () => {
    if (!expoPushToken || !location) return;

    try {
      await NotificationService.updateUserLocation(
        expoPushToken,
        location.latitude,
        location.longitude
      );
      console.log('📍 Ubicación actualizada en el servidor');
    } catch (error) {
      console.error('Error actualizando ubicación:', error);
    }
  };

  const unregister = async () => {
    if (!expoPushToken) return;

    try {
      await NotificationService.unregisterFromServer(expoPushToken);
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      setIsRegistered(false);
      setExpoPushToken(null);
      console.log('🔕 Notificaciones desactivadas');
    } catch (error) {
      console.error('Error desregistrando notificaciones:', error);
    }
  };

  return {
    expoPushToken,
    notification,
    isRegistered,
    unregister,
    refreshRegistration: registerForNotifications
  };
};