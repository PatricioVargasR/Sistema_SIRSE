// services/notificationService.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const BASE_URL = "https://cerberusteck.com.mx/sirse/api";

// Configurar cómo se muestran las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,  // Mostrar banner (reemplaza shouldShowAlert)
    shouldShowList: true,    // Mostrar en el centro de notificaciones
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationToken {
  token: string;
  deviceId: string;
  platform: 'ios' | 'android';
}

export const NotificationService = {
  /**
   * Registrar el dispositivo para recibir notificaciones
   */
  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('⚠️ Las notificaciones push solo funcionan en dispositivos físicos');
      console.log('ℹ️ Usando notificaciones locales en su lugar');
      // Retornar un token "local" para desarrollo
      return 'local-device-token';
    }

    try {
      // Solicitar permisos
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Permiso de notificaciones denegado');
        return null;
      }

      try {
        // Intentar obtener token de Expo Push Notifications
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        
        if (!projectId) {
          console.log('⚠️ No hay projectId configurado');
          console.log('ℹ️ Usando notificaciones locales únicamente');
          console.log('💡 Ejecuta "eas init" para configurar push notifications');
          return 'local-device-token';
        }

        const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
        const token = tokenData.data;
        
        console.log('✅ Token de push obtenido:', token);
        
        // Configurar canal de notificación (Android)
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Reportes SIRSE',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
            sound: 'default',
          });

          await Notifications.setNotificationChannelAsync('urgent', {
            name: 'Alertas Urgentes',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 500, 250, 500],
            lightColor: '#FF0000',
            sound: 'default',
          });
        }

        return token;
      } catch (tokenError: any) {
        console.log('⚠️ Error obteniendo token de push:', tokenError.message);
        console.log('ℹ️ Continuando con notificaciones locales');
        return 'local-device-token';
      }
    } catch (error) {
      console.error('❌ Error registrando notificaciones:', error);
      return null;
    }
  },

  /**
   * Guardar token en el servidor con ubicación del usuario
   */
  async saveTokenToServer(
    token: string, 
    latitude: number, 
    longitude: number
  ): Promise<boolean> {
    try {
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log('Token guardado exitosamente');
            resolve(true);
          } else {
            console.error('Error guardando token:', xhr.status);
            resolve(false);
          }
        };
        
        xhr.onerror = () => {
          console.error('Error de red al guardar token');
          resolve(false);
        };
        
        xhr.open('POST', `${BASE_URL}/register_notification_token.php`);
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        xhr.send(JSON.stringify({
          token,
          latitude,
          longitude,
          platform: Platform.OS,
          device_id: Constants.deviceId || 'unknown'
        }));
      });
    } catch (error) {
      console.error('Error en saveTokenToServer:', error);
      return false;
    }
  },

  /**
   * Actualizar ubicación del usuario en el servidor
   */
  async updateUserLocation(
    token: string,
    latitude: number,
    longitude: number
  ): Promise<boolean> {
    try {
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve) => {
        xhr.onload = () => {
          resolve(xhr.status >= 200 && xhr.status < 300);
        };
        
        xhr.onerror = () => resolve(false);
        
        xhr.open('POST', `${BASE_URL}/update_user_location.php`);
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        xhr.send(JSON.stringify({
          token,
          latitude,
          longitude
        }));
      });
    } catch (error) {
      console.error('Error actualizando ubicación:', error);
      return false;
    }
  },

  /**
   * Cancelar registro de notificaciones
   */
  async unregisterFromServer(token: string): Promise<boolean> {
    try {
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve) => {
        xhr.onload = () => {
          resolve(xhr.status >= 200 && xhr.status < 300);
        };
        
        xhr.onerror = () => resolve(false);
        
        xhr.open('POST', `${BASE_URL}/unregister_notification_token.php`);
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        xhr.send(JSON.stringify({ token }));
      });
    } catch (error) {
      console.error('Error desregistrando token:', error);
      return false;
    }
  },

  /**
   * Mostrar notificación local (para testing)
   */
  async showLocalNotification(
    title: string,
    body: string,
    data?: any
  ): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // Inmediata
    });
  },

  /**
   * Configurar listeners de notificaciones
   */
  setupNotificationListeners(
    onNotificationReceived: (notification: Notifications.Notification) => void,
    onNotificationResponse: (response: Notifications.NotificationResponse) => void
  ) {
    // Cuando se recibe una notificación mientras la app está abierta
    const receivedListener = Notifications.addNotificationReceivedListener(
      onNotificationReceived
    );

    // Cuando el usuario toca una notificación
    const responseListener = Notifications.addNotificationResponseReceivedListener(
      onNotificationResponse
    );

    return () => {
      receivedListener.remove();
      responseListener.remove();
    };
  },

  /**
   * Obtener todas las notificaciones pendientes
   */
  async getAllNotifications(): Promise<Notifications.Notification[]> {
    return await Notifications.getPresentedNotificationsAsync();
  },

  /**
   * Limpiar todas las notificaciones
   */
  async clearAllNotifications(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
  },

  /**
   * Obtener badge count
   */
  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  },

  /**
   * Establecer badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }
};