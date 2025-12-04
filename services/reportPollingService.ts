// services/reportPollingService.ts
import { ReportService } from './reportServices';
import { Report } from '@/config/config_types';
import { calculateDistance } from '@/utils/locationUtils';
import { NotificationService } from './notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_CHECK_KEY = '@sirse_last_check_timestamp';
const SEEN_REPORTS_KEY = '@sirse_seen_reports';
const POLLING_INTERVAL = 2 * 60 * 1000; // 2 minutos
const NOTIFICATION_RADIUS_KM = 5; // 5km de radio

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface PollingConfig {
  enabled: boolean;
  interval: number;
  radius: number;
}

export const ReportPollingService = {
  pollingTimer: null as number | null,
  isPolling: false,
  currentLocation: null as UserLocation | null,
  seenReportIds: new Set<string>(),

  /**
   * Inicializar el servicio de polling
   */
  async initialize(location: UserLocation, config?: Partial<PollingConfig>) {
    this.currentLocation = location;
    
    // Cargar reportes ya vistos
    await this.loadSeenReports();
    
    // Guardar timestamp actual como última verificación
    await AsyncStorage.setItem(LAST_CHECK_KEY, Date.now().toString());
    
    console.log('📡 Servicio de polling inicializado');
  },

  /**
   * Iniciar polling automático
   */
  async startPolling(
    location: UserLocation,
    onNewReports: (reports: Report[]) => void,
    interval: number = POLLING_INTERVAL
  ) {
    if (this.isPolling) {
      console.log('⚠️ Polling ya está activo');
      return;
    }

    this.currentLocation = location;
    this.isPolling = true;

    console.log(`🔄 Iniciando polling cada ${interval / 1000}s`);

    // Primera verificación inmediata
    await this.checkForNewReports(onNewReports);

    // Verificaciones periódicas
    this.pollingTimer = setInterval(async () => {
      await this.checkForNewReports(onNewReports);
    }, interval);
  },

  /**
   * Detener polling
   */
  stopPolling() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer as any);
      this.pollingTimer = null;
    }
    this.isPolling = false;
    console.log('🛑 Polling detenido');
  },

  /**
   * Actualizar ubicación del usuario
   */
  updateLocation(location: UserLocation) {
    this.currentLocation = location;
  },

  /**
   * Verificar si hay nuevos reportes cercanos
   */
  async checkForNewReports(
    onNewReports: (reports: Report[]) => void,
    radius: number = NOTIFICATION_RADIUS_KM
  ): Promise<void> {
    if (!this.currentLocation) {
      console.log('❌ No hay ubicación disponible');
      return;
    }

    try {
      // Obtener timestamp de última verificación
      const lastCheckStr = await AsyncStorage.getItem(LAST_CHECK_KEY);
      const lastCheckTime = lastCheckStr ? parseInt(lastCheckStr) : Date.now() - (24 * 60 * 60 * 1000);

      // Consultar reportes recientes (últimas 24 horas)
      const allReports = await ReportService.getAllReports();

      // Filtrar reportes nuevos que estén cerca
      const newNearbyReports = allReports.filter(report => {
        // Verificar si es nuevo (no lo hemos visto)
        if (this.seenReportIds.has(report.id)) {
          return false;
        }

        // Verificar si fue creado después de la última verificación
        if (report.reportedAtTimestamp <= lastCheckTime) {
          return false;
        }

        // Verificar distancia
        const distance = calculateDistance(
          this.currentLocation!,
          report.coordinates
        );

        return distance <= radius;
      });

      if (newNearbyReports.length > 0) {
        console.log(`🆕 ${newNearbyReports.length} reportes nuevos encontrados`);

        // Marcar reportes como vistos
        newNearbyReports.forEach(report => {
          this.seenReportIds.add(report.id);
        });

        // Guardar reportes vistos
        await this.saveSeenReports();

        // Notificar
        onNewReports(newNearbyReports);

        // Enviar notificaciones push
        for (const report of newNearbyReports) {
          await this.sendNotification(report);
        }
      }

      // Actualizar timestamp de última verificación
      await AsyncStorage.setItem(LAST_CHECK_KEY, Date.now().toString());

    } catch (error) {
      console.error('❌ Error verificando reportes nuevos:', error);
    }
  },

  /**
   * Enviar notificación local por un reporte nuevo
   */
  async sendNotification(report: Report): Promise<void> {
    if (!this.currentLocation) return;

    const distance = calculateDistance(
      this.currentLocation,
      report.coordinates
    );

    const distanceText = distance < 1 
      ? `${Math.round(distance * 1000)}m`
      : `${distance.toFixed(1)}km`;

    await NotificationService.showLocalNotification(
      `🚨 Nuevo reporte cerca de ti`,
      `${report.category}: ${report.title} (${distanceText})`,
      { reportId: report.id }
    );
  },

  /**
   * Cargar reportes ya vistos desde AsyncStorage
   */
  async loadSeenReports(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(SEEN_REPORTS_KEY);
      if (stored) {
        const ids = JSON.parse(stored) as string[];
        this.seenReportIds = new Set(ids);
        console.log(`📦 ${ids.length} reportes cargados como vistos`);
      }
    } catch (error) {
      console.error('Error cargando reportes vistos:', error);
    }
  },

  /**
   * Guardar reportes vistos en AsyncStorage
   */
  async saveSeenReports(): Promise<void> {
    try {
      const ids = Array.from(this.seenReportIds);
      
      // Limitar a los últimos 1000 reportes para no saturar storage
      const limitedIds = ids.slice(-1000);
      
      await AsyncStorage.setItem(SEEN_REPORTS_KEY, JSON.stringify(limitedIds));
    } catch (error) {
      console.error('Error guardando reportes vistos:', error);
    }
  },

  /**
   * Limpiar reportes vistos (útil para testing o reset)
   */
  async clearSeenReports(): Promise<void> {
    this.seenReportIds.clear();
    await AsyncStorage.removeItem(SEEN_REPORTS_KEY);
    await AsyncStorage.removeItem(LAST_CHECK_KEY);
    console.log('🗑️ Reportes vistos eliminados');
  },

  /**
   * Verificar manualmente por nuevos reportes (sin guardar estado)
   */
  async checkOnce(
    location: UserLocation,
    radius: number = NOTIFICATION_RADIUS_KM
  ): Promise<Report[]> {
    try {
      const allReports = await ReportService.getAllReports();
      const now = Date.now();
      const last24h = now - (24 * 60 * 60 * 1000);

      return allReports.filter(report => {
        // Solo reportes de las últimas 24 horas
        if (report.reportedAtTimestamp <= last24h) {
          return false;
        }

        // Verificar distancia
        const distance = calculateDistance(location, report.coordinates);
        return distance <= radius;
      });
    } catch (error) {
      console.error('Error en checkOnce:', error);
      return [];
    }
  },

  /**
   * Obtener estadísticas del servicio
   */
  getStats() {
    return {
      isPolling: this.isPolling,
      seenReportsCount: this.seenReportIds.size,
      hasLocation: !!this.currentLocation,
    };
  }
};