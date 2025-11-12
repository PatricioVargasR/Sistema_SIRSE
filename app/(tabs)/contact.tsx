import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';

export default function ContactScreen() {
  const router = useRouter();

  const emergencyNumbers = [
    { name: 'Emergencias (911)', phone: '911', icon: '🚨', color: '#D32F2F' },
    { name: 'Denuncia Anónima (089)', phone: '089', icon: '🕵️‍♂️', color: '#C62828' },
    { name: 'Seguridad Pública Cuartel', phone: '7757552222', icon: '🚔', color: '#1976D2' },
    { name: 'Seguridad Pública Kiosko', phone: '7757531490', icon: '👮‍♀️', color: '#1565C0' },
    { name: 'Movilidad y Transporte', phone: '7757535081', icon: '🚗', color: '#0288D1' },
    { name: 'Protección Civil', phone: '7757530131', icon: '🧯', color: '#E64A19' },
    { name: 'C4I', phone: '7756890069', icon: '📡', color: '#512DA8' },
    { name: 'Prevención del Delito', phone: '7751314180', icon: '🚫', color: '#7B1FA2' },
    { name: 'Unidad de Primer Contacto (DIF)', phone: '7757531043', icon: '🤝', color: '#AD1457' },
    { name: 'CEAVIF', phone: '7757425172', icon: '👩‍⚖️', color: '#6A1B9A' },
    { name: 'Cruz Roja Mexicana', phone: '7757530412', icon: '🚑', color: '#C2185B' },
  ];

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Números de Emergencia</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Atención inmediata</Text>
        <Text style={styles.description}>
          En caso de emergencia, comunícate con los servicios correspondientes de Tulancingo.
        </Text>

        {emergencyNumbers.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.card, { borderLeftColor: item.color }]}
            onPress={() => handleCall(item.phone)}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{item.icon}</Text>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={[styles.phone, { color: item.color }]}>{item.phone}</Text>
            </View>
            <Text style={styles.callArrow}>📞</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    backgroundColor: '#B71C1C',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  backButton: {
    fontSize: 26,
    color: '#FFF',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#B71C1C',
    marginBottom: 4,
  },
  description: {
    fontSize: 15,
    color: '#424242',
    marginBottom: 20,
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    marginRight: 12,
  },
  icon: {
    fontSize: 22,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
  },
  phone: {
    fontSize: 16,
    fontWeight: '700',
  },
  callArrow: {
    fontSize: 22,
    marginLeft: 6,
  },
});
