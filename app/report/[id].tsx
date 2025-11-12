import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Image,
  ActivityIndicator 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ReportService } from '@/services/reportServices';
import { Report } from '../../data/mockReports';
import { CategoryBadge } from '../../components/CategoryBadge';
import { StatusBadge } from '../../components/StatusBadge';
import { Share } from 'react-native';

export default function ReportDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const data = await ReportService.getReportById(id);
      setReport(data || null);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🕒 Función para formatear el timestamp a fecha y hora legible
  const formatTimestamp = (timestamp: number | string | undefined) => {
    if (!timestamp) return 'Fecha no disponible';
    // Convertir a número si viene como string
    const time = typeof timestamp === 'string' ? Number(timestamp) : timestamp;

    // Si el timestamp está en segundos, convertir a milisegundos
    const date = new Date(time < 10000000000 ? time * 1000 : time);

    return date.toLocaleString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Reporte no encontrado</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del Reporte</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Imagen del reporte */}
        {report.image && (
          <Image 
            source={{ uri: report.image }} 
            style={styles.image}
            resizeMode="cover"
          />
        )}

        {/* Información general */}
        <View style={styles.infoCard}>
          <View style={styles.titleSection}>
            <CategoryBadge category={report.category} size="large" />
            <View style={styles.titleInfo}>
              <Text style={styles.title}>{report.title}</Text>
              <StatusBadge status={report.status} />
            </View>
          </View>

          {/* Detalles */}
          <View style={styles.detailSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📍</Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Ubicación</Text>
                <Text style={styles.detailValue}>{report.location}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>🕐</Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Fecha y hora</Text>
                <Text style={styles.detailValue}>{formatTimestamp(report.reportedAtTimestamp)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionLabel}>Descripción</Text>
            <Text style={styles.descriptionText}>{report.description}</Text>
          </View>

          {report.status === 'En proceso' && (
            <View style={styles.noteCard}>
              <Text style={styles.noteText}>
                Nota: Este reporte ha sido enviado a las autoridades correspondientes para su atención.
              </Text>
            </View>
          )}
        </View>

        {/* Botones de acción */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={async () => {
              try {
                await Share.share({
                  message: `🚨 Reporte: ${report.title}\n\n${report.description}\n\n📍 ${report.location}\n🕒 ${formatTimestamp(report.reportedAtTimestamp)}\n\nVer más en la app.`,
                });
              } catch (error) {
                console.error('Error al compartir:', error);
              }
            }}
          >
            <Text style={styles.shareIcon}>📤</Text>
            <Text style={styles.shareText}>Compartir</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}

// 🎨 Estilos
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 16,
  },
  backLink: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 240,
    backgroundColor: '#E0E0E0',
  },
  infoCard: {
    backgroundColor: '#FFF',
    padding: 20,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleInfo: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  detailSection: {
    marginBottom: 20,
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#212121',
  },
  descriptionSection: {
    marginBottom: 20,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
  noteCard: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  noteText: {
    fontSize: 13,
    color: '#1565C0',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  shareIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  shareText: {
    fontSize: 16,
    color: '#424242',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 8,
  },
  saveIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  saveText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
});
