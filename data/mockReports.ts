export interface Report {
  id: string;
  title: string;
  category: 'Luminarias' | 'Limpieza' | 'Podas y Cortes' | 'Baches/Semáforos' | 'Obras Públicas';
  location: string;
  timestamp: string;
  distance: string;
  status: 'Urgente' | 'En proceso' | 'Pendiente';
  coordinates: { latitude: number; longitude: number };
  description: string;
  image: string | null;
  reportedAt: string; // Mantener para mostrar
  reportedAtTimestamp: number; // ✅ NUEVO: timestamp en milisegundos
  markerColor?: string;
}

// ✅ Helper para generar timestamps relativos
const getTimestamp = (hoursAgo: number): number => {
  return Date.now() - (hoursAgo * 60 * 60 * 1000);
};

export const MOCK_REPORTS: Report[] = [
  {
    id: '1',
    title: 'Lámpara apagada',
    category: 'Luminarias',
    location: 'Av. Principal esq. Calle 5',
    timestamp: 'Hace 15 min',
    distance: '0.5 km de distancia',
    status: 'Urgente',
    coordinates: { latitude: 20.140636, longitude: -98.339486 },
    description: 'Lámpara del alumbrado público apagada en esquina principal. Requiere reparación.',
    image: null,
    reportedAt: '15 Oct 2025 - 14:35',
    reportedAtTimestamp: getTimestamp(0.25), // Hace 15 min
    markerColor: '#FFC107'
  },
  {
    id: '2',
    title: 'Acumulación de basura',
    category: 'Limpieza',
    location: 'Blvd. Norte #234',
    timestamp: 'Hace 32 min',
    distance: '1.2 km de distancia',
    status: 'En proceso',
    coordinates: { latitude: 20.140150, longitude: -98.334950 },
    description: 'Se observa basura acumulada en la vía pública. Se requiere recolección.',
    image: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=400',
    reportedAt: '15 Oct 2025 - 14:35',
    reportedAtTimestamp: getTimestamp(0.5), // Hace 32 min
    markerColor: '#4CAF50'
  },
  {
    id: '3',
    title: 'Árbol obstruye vía pública',
    category: 'Podas y Cortes',
    location: 'Entrada Parque Central',
    timestamp: 'Hace 1 hora',
    distance: '2.1 km de distancia',
    status: 'Pendiente',
    coordinates: { latitude: 20.140998, longitude: -98.335959 },
    description: 'Árbol caído obstruye paso peatonal. Requiere poda urgente.',
    image: null,
    reportedAt: '15 Oct 2025 - 13:15',
    reportedAtTimestamp: getTimestamp(1), // Hace 1 hora
    markerColor: '#2196F3'
  },
  {
    id: '4',
    title: 'Bache peligroso',
    category: 'Obras Públicas',
    location: 'Col. Jardines, Calle 8',
    timestamp: 'Hace 2 horas',
    distance: '3.7 km de distancia',
    status: 'Urgente',
    coordinates: { latitude: 20.142893, longitude: -98.337069 },
    description: 'Bache grande que representa peligro para automóviles. Requiere arreglo inmediato.',
    image: null,
    reportedAt: '15 Oct 2025 - 12:30',
    reportedAtTimestamp: getTimestamp(2), // Hace 2 horas
    markerColor: '#FF5722'
  },
  // ✅ Agregar más reportes con diferentes fechas para probar filtros
  {
    id: '5',
    title: 'Fuga de agua',
    category: 'Obras Públicas',
    location: 'Calle Hidalgo #45',
    timestamp: 'Hace 3 días',
    distance: '1.5 km de distancia',
    status: 'En proceso',
    coordinates: { latitude: 20.141500, longitude: -98.336500 },
    description: 'Fuga de agua en tubería principal.',
    image: null,
    reportedAt: '12 Oct 2025 - 10:20',
    reportedAtTimestamp: getTimestamp(72), // Hace 3 días
    markerColor: '#FF5722'
  },
  {
    id: '6',
    title: 'Semáforo descompuesto',
    category: 'Baches/Semáforos',
    location: 'Cruce Av. Juárez',
    timestamp: 'Hace 15 días',
    distance: '2.8 km de distancia',
    status: 'Pendiente',
    coordinates: { latitude: 20.139800, longitude: -98.338200 },
    description: 'Semáforo no funciona, genera caos vial.',
    image: null,
    reportedAt: '30 Sep 2025 - 08:15',
    reportedAtTimestamp: getTimestamp(360), // Hace 15 días
    markerColor: '#FF5722'
  },
  {
    id: '7',
    title: 'Parque sucio',
    category: 'Limpieza',
    location: 'Parque Morelos',
    timestamp: 'Hace 25 días',
    distance: '1.8 km de distancia',
    status: 'Pendiente',
    coordinates: { latitude: 20.141200, longitude: -98.337800 },
    description: 'Acumulación de basura en áreas verdes.',
    image: null,
    reportedAt: '20 Sep 2025 - 16:45',
    reportedAtTimestamp: getTimestamp(900), // Hace 25 días
    markerColor: '#4CAF50'
  },
];

export const CATEGORIES = {
  'Luminarias': { color: '#FFC107', icon: '💡' },
  'Limpieza': { color: '#4CAF50', icon: '🗑️' },
  'Podas y Cortes': { color: '#2196F3', icon: '⚠️' },
  'Baches/Semáforos': { color: '#FF5722', icon: '🚧' },
  'Obras Públicas': { color: '#FF5722', icon: '🚧' }
};