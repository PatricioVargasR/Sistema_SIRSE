import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { ReportService } from '@/services/reportServices';
import { Report, CATEGORIES } from '../../data/mockReports';
import { DrawerMenu } from '@/components/DrawnerMenu';
import { useLocation } from '@/hooks/useLocation';
import * as Linking from 'expo-linking';

// TODO: Obtener solo los reportes de esa zona, más no filtrarlos

interface LocationCoords {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export default function MapScreen() {
  const router = useRouter();
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [visibleReports, setVisibleReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null);
  const mapRef = useRef<MapView>(null);

  // 🔥 Usar el hook de ubicación
  const { location, hasPermission, loading: locationLoading, refreshLocation } = useLocation(true);

  // Convertir location del hook a LocationCoords con deltas
  const userLocation: LocationCoords | null = location ? {
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: location.latitudeDelta || 0.05,
    longitudeDelta: location.longitudeDelta || 0.05,
  } : null;

  useEffect(() => {
    loadReports();
  }, []);

  // Filtrar reportes cuando cambia la región visible
  useEffect(() => {
    if (currentRegion && allReports.length > 0) {
      filterVisibleReports(currentRegion);
    }
  }, [currentRegion, allReports]);

  // Establecer región inicial cuando la ubicación esté lista
  useEffect(() => {
    if (userLocation && !currentRegion) {
      setCurrentRegion(userLocation);
    }
  }, [userLocation]);

  // Centrar mapa en ubicación del usuario
  const centerOnUser = async () => {
    if (hasPermission) {
      await refreshLocation();
      // Animar el mapa a la nueva ubicación
      if (mapRef.current && userLocation) {
        mapRef.current.animateToRegion(userLocation, 1000);
      }
    } else {
      Alert.alert(
        'Ubicación desactivada',
        'Por favor, activa los permisos de ubicación en la configuración de tu dispositivo.'
      );
    }
  };

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await ReportService.getAllReports();
      setAllReports(data);
      // Si ya hay una región, filtrar inmediatamente
      if (currentRegion) {
        filterVisibleReports(currentRegion, data);
      } else {
        setVisibleReports(data);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar reportes que están dentro de la región visible
  const filterVisibleReports = (region: Region, reports: Report[] = allReports) => {
    const minLat = region.latitude - region.latitudeDelta / 2;
    const maxLat = region.latitude + region.latitudeDelta / 2;
    const minLng = region.longitude - region.longitudeDelta / 2;
    const maxLng = region.longitude + region.longitudeDelta / 2;

    const filtered = reports.filter(report => {
      const lat = report.coordinates.latitude;
      const lng = report.coordinates.longitude;
      return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
    });

    setVisibleReports(filtered);
  };

  // Manejar cambio de región del mapa
  const handleRegionChange = (region: Region) => {
    setCurrentRegion(region);
  };

  // Obtener el icono según la categoría
  const getCategoryIcon = (category: keyof typeof CATEGORIES) => {
    const config = CATEGORIES[category];
    return config.icon;
  };

  const openWhatsApp = (phoneNumber: string, message: string) => {
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert(
        'WhatsApp no encontrado',
        'Asegúrate de tener WhatsApp instalado.'
      );
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setDrawerVisible(true)}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SIRSE</Text>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => router.push(`/explore`)}
        >
          <Text style={styles.menuIcon}>📋</Text>
        </TouchableOpacity>
      </View>

      {/* Map Area */}
      <View style={styles.mapContainer}>
        {userLocation ? (
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={userLocation}
            showsUserLocation={hasPermission}
            showsMyLocationButton={false}
            showsCompass={true}
            showsScale={true}
            onRegionChangeComplete={handleRegionChange}
          >
            {/* Marcadores de reportes visibles */}
            {visibleReports.map((report) => (
              <Marker
                key={report.id}
                coordinate={{
                  latitude: report.coordinates.latitude,
                  longitude: report.coordinates.longitude,
                }}
                onPress={() => router.push(`/report/${report.id}`)}
              >
                <View style={styles.customMarker}>
                  <View style={[
                    styles.markerBadge,
                    { backgroundColor: CATEGORIES[report.category].color }
                  ]}>
                    <Text style={styles.markerIcon}>
                      {getCategoryIcon(report.category)}
                    </Text>
                  </View>
                  {report.status === 'Urgente' && (
                    <View style={styles.urgentIndicator} />
                  )}
                </View>
              </Marker>
            ))}
          </MapView>
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Cargando mapa...</Text>
          </View>
        )}

        {/* Info Badge - Contador de reportes visibles */}
        <View style={styles.infoBadge}>
          <Text style={styles.infoBadgeText}>
            📍 {visibleReports.length} {visibleReports.length === 1 ? 'reporte' : 'reportes'} en esta área
          </Text>
        </View>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={centerOnUser}
          >
            <Text style={styles.controlIcon}>🎯</Text>
          </TouchableOpacity>
        </View>

        {/* FAB Button */}
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => {
            Alert.alert(
              'Reportar Incidente',
              '¿Deseas enviar tu reporte directamente por WhatsApp?',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Abrir WhatsApp',
                  onPress: () => openWhatsApp('7714393946', 'Hola, deseo reportar un incidente.')
                },
              ]
            );
          }}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Tipos de reportes</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.legendItems}>
            {Object.entries(CATEGORIES).map(([name, config]) => (
              <View key={name} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: config.color }]} />
                <Text style={styles.legendText}>{name}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Drawer Menu */}
      <DrawerMenu
        visible={drawerVisible} 
        onClose={() => setDrawerVisible(false)} 
      />
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 24,
    color: '#FFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 2,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#757575',
  },
  infoBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  infoBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2196F3',
  },
  mapControls: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    gap: 12,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  controlIcon: {
    fontSize: 20,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: '#FFF',
    fontWeight: '300',
  },
  legend: {
    backgroundColor: '#FFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  legendTitle: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 12,
    fontWeight: '600',
  },
  legendItems: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#424242',
  },
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  markerIcon: {
    fontSize: 18,
  },
  urgentIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF5252',
    borderWidth: 2,
    borderColor: '#FFF',
  },
});