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
  reportedAt: string;
}

export const MOCK_REPORTS: Report[] = [
  {
    id: '1',
    title: 'Lámpara apagada',
    category: 'Luminarias',
    location: 'Av. Principal esq. Calle 5',
    timestamp: 'Hace 15 min',
    distance: '0.5 km de distancia',
    status: 'Urgente',
    coordinates: { latitude: 20.5888, longitude: -100.3899 },
    description: 'Se observa lámpara del alumbrado público apagada en la esquina. Es necesaria la intervención de servicios municipales para la reparación.',
    image: null,
    reportedAt: '15 Oct 2025 - 14:35'
  },
  {
    id: '2',
    title: 'Acumulación de basura',
    category: 'Limpieza',
    location: 'Blvd. Norte #234',
    timestamp: 'Hace 32 min',
    distance: '1.2 km de distancia',
    status: 'En proceso',
    coordinates: { latitude: 20.5920, longitude: -100.3920 },
    description: 'Se observa acumulación de basura en la vía pública. Es necesaria la intervención de servicios municipales para la recolección.',
    image: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=400',
    reportedAt: '15 Oct 2025 - 14:35'
  },
  {
    id: '3',
    title: 'Árbol obstruye vía pública',
    category: 'Podas y Cortes',
    location: 'Parque Central',
    timestamp: 'Hace 1 hora',
    distance: '2.1 km de distancia',
    status: 'Pendiente',
    coordinates: { latitude: 20.5950, longitude: -100.3850 },
    description: 'Árbol caído obstruye completamente el paso peatonal. Se requiere atención urgente para remover el árbol.',
    image: null,
    reportedAt: '15 Oct 2025 - 13:15'
  },
  {
    id: '4',
    title: 'Bache en la calle',
    category: 'Obras Públicas',
    location: 'Col. Jardines, Calle 8',
    timestamp: 'Hace 2 horas',
    distance: '3.7 km de distancia',
    status: 'Urgente',
    coordinates: { latitude: 20.5870, longitude: -100.3970 },
    description: 'Bache de gran tamaño en la calzada representa un peligro para vehículos y peatones. Requiere reparación urgente.',
    image: null,
    reportedAt: '15 Oct 2025 - 12:30'
  }
];

export const CATEGORIES = {
  'Luminarias': { color: '#FFC107', icon: '💡' },
  'Limpieza': { color: '#4CAF50', icon: '🗑️' },
  'Podas y Cortes': { color: '#2196F3', icon: '⚠️' },
  'Baches/Semáforos': { color: '#FF5722', icon: '🚧' },
  'Obras Públicas': { color: '#FF5722', icon: '🚧' }
};
