// ==========================================
// app/heatmap.tsx - PANTALLA DE MAPA DE CALOR
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker, Circle, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { Report, CATEGORIES } from '@/data/mockReports';
import { ReportService } from '@/services/reportServices';
import { useLocation } from '@/hooks/useLocation';

// TODO: Obtener solo los reportes de esa zona, más no filtrarlos
const { width, height } = Dimensions.get('window');

interface LocationCoords {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export default function HeatmapScreen() {
  const router = useRouter();
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [visibleReports, setVisibleReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [currentRegion, setCurrentRegion] = useState<Region | null>(null);

  // 🔥 Usar el hook de ubicación
  const { location, hasPermission, loading: locationLoading } = useLocation(true);

  // Convertir location del hook a LocationCoords con deltas
  const userLocation: LocationCoords | null = location ? {
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: location.latitudeDelta || 0.05,
    longitudeDelta: location.longitudeDelta || 0.05,
  } : null;

  useEffect(() => {
    loadReports();
  }, [selectedCategory, timeRange]);

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

  const loadReports = async () => {
    setLoading(true);
    try {
      const filters = selectedCategory ? { category: selectedCategory } : {};
      const data = await ReportService.getAllReports(filters);
      
      // ✅ Filtrar por rango de tiempo
      const filteredByTime = filterByTimeRange(data, timeRange);
      
      setAllReports(filteredByTime);
      
      if (currentRegion) {
        filterVisibleReports(currentRegion, filteredByTime);
      } else {
        setVisibleReports(filteredByTime);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterByTimeRange = (reports: Report[], range: '24h' | '7d' | '30d'): Report[] => {
    const now = Date.now();
    let maxAge = 0;

    switch (range) {
      case '24h':
        maxAge = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
        break;
      case '7d':
        maxAge = 7 * 24 * 60 * 60 * 1000; // 7 días
        break;
      case '30d':
        maxAge = 30 * 24 * 60 * 60 * 1000; // 30 días
        break;
    }

    return reports.filter(report => {
      const reportAge = now - report.reportedAtTimestamp;
      return reportAge <= maxAge;
    });
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

  // Calcular densidad de reportes por zona basado en coordenadas reales
  const calculateHeatZones = () => {
    if (visibleReports.length === 0) return [];

    // Radio de agrupación (aproximadamente 500 metros)
    const clusterRadius = 0.005;
    const clusters: Array<{
      lat: number;
      lng: number;
      count: number;
      reports: Report[];
    }> = [];

    // Agrupar reportes cercanos
    visibleReports.forEach(report => {
      let addedToCluster = false;

      for (const cluster of clusters) {
        const distance = Math.sqrt(
          Math.pow(cluster.lat - report.coordinates.latitude, 2) +
          Math.pow(cluster.lng - report.coordinates.longitude, 2)
        );

        if (distance < clusterRadius) {
          cluster.count++;
          cluster.reports.push(report);
          // Actualizar centro del cluster
          cluster.lat = cluster.reports.reduce((sum, r) => sum + r.coordinates.latitude, 0) / cluster.reports.length;
          cluster.lng = cluster.reports.reduce((sum, r) => sum + r.coordinates.longitude, 0) / cluster.reports.length;
          addedToCluster = true;
          break;
        }
      }

      if (!addedToCluster) {
        clusters.push({
          lat: report.coordinates.latitude,
          lng: report.coordinates.longitude,
          count: 1,
          reports: [report]
        });
      }
    });

    // Calcular intensidad basada en la cantidad de reportes
    const maxCount = Math.max(...clusters.map(c => c.count), 1);
    
    return clusters.map(cluster => {
      const intensity = Math.min(cluster.count / maxCount, 1);
      return {
        latitude: cluster.lat,
        longitude: cluster.lng,
        intensity,
        count: cluster.count
      };
    });
  };

  const heatZones = calculateHeatZones();

  // Obtener color según intensidad
  const getHeatColor = (intensity: number) => {
    if (intensity >= 0.8) return 'rgba(255, 0, 0, 0.5)';      // Rojo intenso
    if (intensity >= 0.6) return 'rgba(255, 87, 34, 0.4)';    // Naranja
    if (intensity >= 0.4) return 'rgba(255, 152, 0, 0.35)';   // Amarillo-naranja
    if (intensity >= 0.2) return 'rgba(255, 235, 59, 0.3)';   // Amarillo
    return 'rgba(76, 175, 80, 0.25)';                         // Verde (bajo)
  };

  // Obtener radio según intensidad
  const getHeatRadius = (intensity: number, count: number) => {
    const baseRadius = 200; // metros
    const maxRadius = 800;  // metros
    return Math.min(baseRadius + (intensity * count * 100), maxRadius);
  };

  // Estadísticas por categoría (basadas en reportes visibles)
  const getCategoryStats = () => {
    const stats: Record<string, number> = {};
    visibleReports.forEach(report => {
      stats[report.category] = (stats[report.category] || 0) + 1;
    });
    return stats;
  };

  const categoryStats = getCategoryStats();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mapa de Calor</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Selector de Rango de Tiempo */}
        <View style={styles.timeRangeContainer}>
          <Text style={styles.sectionTitle}>Período de análisis</Text>
          <View style={styles.timeRangeButtons}>
            <TouchableOpacity
              style={[
                styles.timeButton,
                timeRange === '24h' && styles.timeButtonActive
              ]}
              onPress={() => setTimeRange('24h')}
            >
              <Text style={[
                styles.timeButtonText,
                timeRange === '24h' && styles.timeButtonTextActive
              ]}>
                24 horas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.timeButton,
                timeRange === '7d' && styles.timeButtonActive
              ]}
              onPress={() => setTimeRange('7d')}
            >
              <Text style={[
                styles.timeButtonText,
                timeRange === '7d' && styles.timeButtonTextActive
              ]}>
                7 días
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.timeButton,
                timeRange === '30d' && styles.timeButtonActive
              ]}
              onPress={() => setTimeRange('30d')}
            >
              <Text style={[
                styles.timeButtonText,
                timeRange === '30d' && styles.timeButtonTextActive
              ]}>
                30 días
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Mapa de Calor */}
        <View style={styles.heatmapCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Zonas de Mayor Incidencia</Text>
            <View style={styles.reportCounter}>
              <Text style={styles.reportCounterText}>
                📍 {visibleReports.length}
              </Text>
            </View>
          </View>
          
          {loading || !userLocation ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2196F3" />
              <Text style={styles.loadingText}>Cargando mapa...</Text>
            </View>
          ) : (
            <View style={styles.heatmapContainer}>
              <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={userLocation}
                showsUserLocation={hasPermission}
                showsMyLocationButton={false}
                scrollEnabled={true}
                zoomEnabled={true}
                pitchEnabled={false}
                rotateEnabled={false}
                onRegionChangeComplete={handleRegionChange}
              >
                {/* Círculos de calor */}
                {heatZones.map((zone, index) => (
                  <Circle
                    key={`circle-${index}`}
                    center={{
                      latitude: zone.latitude,
                      longitude: zone.longitude,
                    }}
                    radius={getHeatRadius(zone.intensity, zone.count)}
                    fillColor={getHeatColor(zone.intensity)}
                    strokeColor="transparent"
                  />
                ))}

                {/* Marcadores con conteo */}
                {heatZones.map((zone, index) => (
                  <Marker
                    key={`marker-${index}`}
                    coordinate={{
                      latitude: zone.latitude,
                      longitude: zone.longitude,
                    }}
                  >
                    <View style={styles.heatMarker}>
                      <View style={[
                        styles.heatMarkerBadge,
                        { 
                          backgroundColor: getHeatColor(zone.intensity).replace('0.5', '0.9').replace('0.4', '0.9').replace('0.35', '0.9').replace('0.3', '0.9').replace('0.25', '0.9')
                        }
                      ]}>
                        <Text style={styles.heatMarkerText}>{zone.count}</Text>
                      </View>
                    </View>
                  </Marker>
                ))}
              </MapView>

              {heatZones.length === 0 && !loading && (
                <View style={styles.emptyStateOverlay} pointerEvents="none">
                  <Text style={styles.emptyStateText}>
                    📍 No hay reportes en esta área
                  </Text>
                  <Text style={styles.emptyStateSubtext}>
                    Mueve el mapa para explorar otras zonas
                  </Text>
                </View>
              )}

            </View>
          )}

          {/* Leyenda de intensidad */}
          <View style={styles.legend}>
            <Text style={styles.legendTitle}>Nivel de incidencia</Text>
            <View style={styles.legendScale}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: 'rgba(76, 175, 80, 0.5)' }]} />
                <Text style={styles.legendText}>Baja</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: 'rgba(255, 235, 59, 0.5)' }]} />
                <Text style={styles.legendText}>Media</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: 'rgba(255, 152, 0, 0.5)' }]} />
                <Text style={styles.legendText}>Alta</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: 'rgba(255, 0, 0, 0.5)' }]} />
                <Text style={styles.legendText}>Crítica</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Estadísticas por Categoría */}
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Incidentes por Categoría</Text>
          <Text style={styles.statsSubtitle}>
            En esta área: {visibleReports.length} {visibleReports.length === 1 ? 'reporte' : 'reportes'}
          </Text>

          <View style={styles.categoryList}>
            {Object.entries(CATEGORIES).map(([category, config]) => {
              const count = categoryStats[category] || 0;
              const percentage = visibleReports.length > 0 
                ? ((count / visibleReports.length) * 100).toFixed(0) 
                : 0;

              if (count === 0) return null; // No mostrar categorías sin reportes

              return (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryItem,
                    selectedCategory === category && styles.categoryItemActive
                  ]}
                  onPress={() => setSelectedCategory(
                    selectedCategory === category ? null : category
                  )}
                >
                  <View style={styles.categoryLeft}>
                    <View style={[
                      styles.categoryIcon,
                      { backgroundColor: config.color }
                    ]}>
                      <Text style={styles.categoryEmoji}>{config.icon}</Text>
                    </View>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryName}>{category}</Text>
                      <Text style={styles.categoryCount}>{count} {count === 1 ? 'reporte' : 'reportes'}</Text>
                    </View>
                  </View>

                  <View style={styles.categoryRight}>
                    <Text style={styles.categoryPercentage}>{percentage}%</Text>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill,
                          { 
                            width: `${percentage}%` as any,
                            backgroundColor: config.color
                          }
                        ]} 
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {visibleReports.length === 0 && (
            <Text style={styles.noDataText}>
              Mueve el mapa para ver estadísticas de otras áreas
            </Text>
          )}
        </View>

        {/* Recomendaciones */}
        <View style={styles.recommendationsCard}>
          <Text style={styles.cardTitle}>💡 Recomendaciones</Text>
          <View style={styles.recommendationsList}>
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationIcon}>🚨</Text>
              <Text style={styles.recommendationText}>
                Evita transitar por zonas marcadas en rojo durante horarios nocturnos
              </Text>
            </View>
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationIcon}>👥</Text>
              <Text style={styles.recommendationText}>
                Mantén informados a tus familiares sobre tu ubicación
              </Text>
            </View>
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationIcon}>📱</Text>
              <Text style={styles.recommendationText}>
                Activa las notificaciones para recibir alertas en tiempo real
              </Text>
            </View>
            <View style={styles.recommendationItem}>
              <Text style={styles.recommendationIcon}>🗺️</Text>
              <Text style={styles.recommendationText}>
                Explora el mapa moviendo y haciendo zoom para descubrir zonas seguras
              </Text>
            </View>
          </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backButton: {
    fontSize: 28,
    color: '#FFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  placeholder: {
    width: 28,
  },
  content: {
    flex: 1,
  },
  timeRangeContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 12,
  },
  timeRangeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  timeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
  },
  timeButtonActive: {
    backgroundColor: '#2196F3',
  },
  timeButtonText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '500',
  },
  timeButtonTextActive: {
    color: '#FFF',
  },
  heatmapCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  reportCounter: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  reportCounterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2196F3',
  },
  loadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#757575',
  },
  heatmapContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  heatMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heatMarkerBadge: {
    minWidth: 32,
    minHeight: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  heatMarkerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  emptyStateOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#757575',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: '#9E9E9E',
    textAlign: 'center',
  },
  legend: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#757575',
    marginBottom: 8,
  },
  legendScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    alignItems: 'center',
    gap: 4,
  },
  legendColor: {
    width: 40,
    height: 20,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: '#757575',
  },
  statsCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsSubtitle: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 16,
  },
  categoryList: {
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryItemActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 12,
    color: '#757575',
  },
  categoryRight: {
    alignItems: 'flex-end',
    width: 80,
  },
  categoryPercentage: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2196F3',
    marginBottom: 4,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  noDataText: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  recommendationsCard: {
    backgroundColor: '#FFF3E0',
    marginHorizontal: 16,
    marginBottom: 32,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  recommendationsList: {
    gap: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  recommendationIcon: {
    fontSize: 20,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
});