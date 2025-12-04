import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useReportPolling } from '@/hooks/useReportPolling';
import { NotificationService } from '@/services/notificationService';

export default function NotificationsSettingsScreen() {
  const router = useRouter();
  const {
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
  } = useReportPolling();

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [stats, setStats] = useState({ isPolling: false, seenReportsCount: 0, hasLocation: false });

  useEffect(() => {
    checkNotificationPermissions();
    updateStats();
  }, []);

  useEffect(() => {
    updateStats();
  }, [isActive]);

  const checkNotificationPermissions = async () => {
    const token = await NotificationService.registerForPushNotifications();
    setNotificationsEnabled(!!token);
  };

  const updateStats = () => {
    setStats(getStats());
  };

  const handleTogglePolling = async (value: boolean) => {
    if (value && !notificationsEnabled) {
      Alert.alert(
        'Permisos requeridos',
        'Para recibir notificaciones, necesitas activar los permisos de notificaciones.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Activar',
            onPress: async () => {
              const token = await NotificationService.registerForPushNotifications();
              if (token) {
                setNotificationsEnabled(true);
                await togglePolling(true);
              } else {
                Alert.alert('Error', 'No se pudieron activar las notificaciones');
              }
            }
          }
        ]
      );
      return;
    }

    await togglePolling(value);
  };

  const handleSetInterval = (minutes: number) => {
    Alert.alert(
      'Cambiar frecuencia',
      `¿Verificar cada ${minutes} minutos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => setPollingInterval(minutes * 60 * 1000)
        }
      ]
    );
  };

  const handleTestNotification = async () => {
    await NotificationService.showLocalNotification(
      '🚨 Notificación de prueba',
      'Este es un ejemplo de cómo se verán las notificaciones de nuevos reportes',
      { reportId: 'test' }
    );
  };

  const handleCheckNow = async () => {
    const loadingAlert = Alert.alert('Verificando...', 'Buscando nuevos reportes cercanos');
    
    try {
      // Timeout de 10 segundos
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );
      
      await Promise.race([
        checkNow(),
        timeoutPromise
      ]);
      
      updateStats();
      
      // Cerrar alert de "Verificando..."
      Alert.alert(
        '✅ Verificación completa',
        `Reportes procesados: ${getStats().seenReportsCount}`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      if (error.message === 'Timeout') {
        Alert.alert(
          '⏱️ Tiempo agotado',
          'La verificación está tomando demasiado tiempo. Revisa tu conexión a internet.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          '❌ Error',
          'No se pudo verificar reportes. Intenta de nuevo.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleResetSeenReports = () => {
    Alert.alert(
      'Resetear reportes vistos',
      'Esto hará que vuelvas a recibir notificaciones de reportes anteriores. ¿Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetear',
          style: 'destructive',
          onPress: async () => {
            await resetSeenReports();
            updateStats();
          }
        }
      ]
    );
  };

  const formatLastUpdate = () => {
    if (!lastUpdate) return 'Nunca';
    
    const now = new Date();
    const diff = now.getTime() - lastUpdate.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Hace menos de 1 minuto';
    if (minutes === 1) return 'Hace 1 minuto';
    if (minutes < 60) return `Hace ${minutes} minutos`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return 'Hace 1 hora';
    return `Hace ${hours} horas`;
  };

  const currentInterval = config.interval / 60000;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaciones</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Estado actual */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: isActive ? '#4CAF50' : '#9E9E9E' }
            ]} />
            <Text style={styles.statusTitle}>
              {isActive ? '✅ Activo' : '⏸️ Inactivo'}
            </Text>
          </View>
          
          {isActive && (
            <>
              <Text style={styles.statusDetail}>
                Verificando cada {currentInterval} minutos
              </Text>
              <Text style={styles.statusDetail}>
                Última verificación: {formatLastUpdate()}
              </Text>
              <Text style={styles.statusDetail}>
                Radio de búsqueda: {config.radius} km
              </Text>
            </>
          )}
          
          {newReportsCount > 0 && (
            <TouchableOpacity
              style={styles.newReportsBadge}
              onPress={clearNewReportsCount}
            >
              <Text style={styles.newReportsText}>
                🆕 {newReportsCount} {newReportsCount === 1 ? 'reporte nuevo' : 'reportes nuevos'}
              </Text>
              <Text style={styles.clearText}>Limpiar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Control principal */}
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Alertas automáticas</Text>
              <Text style={styles.settingDescription}>
                Recibe notificaciones de reportes nuevos cercanos a ti
              </Text>
            </View>
            <Switch
              value={config.enabled}
              onValueChange={handleTogglePolling}
              trackColor={{ false: '#E0E0E0', true: '#81C784' }}
              thumbColor={config.enabled ? '#4CAF50' : '#9E9E9E'}
            />
          </View>
        </View>

        {/* Frecuencia de verificación */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Frecuencia de verificación</Text>
          <Text style={styles.cardDescription}>
            Define cada cuánto tiempo verificar por nuevos reportes
          </Text>

          <View style={styles.intervalButtons}>
            {[1, 2, 5, 10, 15].map(minutes => (
              <TouchableOpacity
                key={minutes}
                style={[
                  styles.intervalButton,
                  currentInterval === minutes && styles.intervalButtonActive
                ]}
                onPress={() => handleSetInterval(minutes)}
                disabled={!config.enabled}
              >
                <Text style={[
                  styles.intervalButtonText,
                  currentInterval === minutes && styles.intervalButtonTextActive,
                  !config.enabled && styles.intervalButtonTextDisabled
                ]}>
                  {minutes} min
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.intervalNote}>
            ⚡ Intervalos más cortos consumen más batería
          </Text>
        </View>

        {/* Estadísticas */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Estadísticas</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.seenReportsCount}</Text>
              <Text style={styles.statLabel}>Reportes procesados</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{config.radius} km</Text>
              <Text style={styles.statLabel}>Radio de búsqueda</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {stats.hasLocation ? '✅' : '❌'}
              </Text>
              <Text style={styles.statLabel}>Ubicación</Text>
            </View>
          </View>
        </View>

        {/* Acciones */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Acciones</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCheckNow}
            disabled={!config.enabled}
          >
            <Text style={styles.actionIcon}>🔍</Text>
            <Text style={styles.actionText}>Verificar ahora</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleTestNotification}
          >
            <Text style={styles.actionIcon}>🔔</Text>
            <Text style={styles.actionText}>Probar notificación</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonDanger]}
            onPress={handleResetSeenReports}
          >
            <Text style={styles.actionIcon}>🔄</Text>
            <Text style={styles.actionText}>Resetear reportes vistos</Text>
          </TouchableOpacity>
        </View>

        {/* Info adicional */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ Cómo funciona</Text>
          <Text style={styles.infoText}>
            • La app verifica periódicamente si hay reportes nuevos{'\n'}
            • Solo te notifica de reportes dentro de {config.radius}km{'\n'}
            • No recibirás notificaciones duplicadas{'\n'}
            • Las verificaciones se pausan cuando la app está cerrada
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backButton: {
    fontSize: 28,
    color: '#FFF',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  statusDetail: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  newReportsBadge: {
    marginTop: 12,
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newReportsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
  },
  clearText: {
    fontSize: 12,
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#757575',
  },
  intervalButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  intervalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  intervalButtonActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  intervalButtonText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '500',
  },
  intervalButtonTextActive: {
    color: '#2196F3',
    fontWeight: '600',
  },
  intervalButtonTextDisabled: {
    color: '#BDBDBD',
  },
  intervalNote: {
    fontSize: 12,
    color: '#FF9800',
    fontStyle: 'italic',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2196F3',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 8,
  },
  actionButtonDanger: {
    backgroundColor: '#FFEBEE',
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  actionText: {
    fontSize: 15,
    color: '#424242',
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#424242',
    lineHeight: 20,
  },
});