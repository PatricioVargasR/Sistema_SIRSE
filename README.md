# 📱 SIRSE Mobile - App Ciudadana de Reportes

<div align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white" />
</div>

<br>

<div align="center">
  <h3>🛡️ Sistema Integral de Reportes de Seguridad y Emergencias</h3>
  <p>Aplicación móvil ciudadana para Tulancingo de Bravo, Hidalgo</p>
</div>

## 📋 Descripción

**SIRSE Mobile** es la aplicación móvil ciudadana del Sistema Integral de Reportes de Seguridad y Emergencias, desarrollada para los habitantes de **Tulancingo de Bravo, Hidalgo**. 

La app permite visualizar en tiempo real los incidentes de seguridad y servicios urbanos reportados por la comunidad, ayudando a los ciudadanos a tomar decisiones informadas sobre rutas seguras y manteniéndolos al tanto de la situación en su colonia.

### 🎯 Propósito

Proporcionar a los ciudadanos una herramienta confiable y dinámica para:
- 📍 Visualizar reportes georeferenciados en un mapa interactivo
- 🔥 Identificar zonas de riesgo mediante mapas de calor
- 🔔 Recibir notificaciones sobre incidentes cercanos
- 👥 Fomentar la colaboración comunitaria
- 🚨 Tomar decisiones preventivas informadas

> **Nota**: Los reportes se generan mediante el **Chatbot de WhatsApp** de SIRSE. Esta aplicación móvil es **exclusivamente de consulta y visualización**.

## ✨ Características Principales

### 🗺️ Mapa Interactivo
- Visualización de todos los reportes activos con georreferencias precisas
- Marcadores categorizados por tipo de incidente
- Grid de navegación intuitivo
- Ubicación del usuario en tiempo real
- Controles de zoom y navegación

### 🔥 Mapas de Calor
- Identificación visual de zonas con mayor concentración de incidentes
- Análisis temporal de patrones de riesgo
- Actualización en tiempo real

### 📋 Feed de Reportes
- Lista completa de incidentes reportados
- Filtros por categoría y estado
- Búsqueda por cercanía ("Cerca de ti")
- Vista de reportes recientes
- Acceso a detalles completos de cada reporte

### 🔔 Notificaciones Push
- Alertas inmediatas sobre incidentes cercanos
- Notificaciones personalizables por categoría
- Avisos de cambio de estado en reportes guardados

### 🔒 Privacidad y Seguridad
- Los reportes públicos son completamente anónimos
- No requiere registro ni datos personales para consultar
- Suscripción opcional para notificaciones (solo email)

## 📊 Categorías de Reportes

La app muestra reportes organizados en las siguientes categorías:

| Categoría | Icono | Color | Descripción |
|-----------|-------|-------|-------------|
| **Luminarias** | 💡 | Amarillo (`#FFC107`) | Lámparas de alumbrado público apagadas o dañadas |
| **Limpieza** | 🗑️ | Verde (`#4CAF50`) | Acumulación de basura en vía pública |
| **Podas y Cortes** | ⚠️ | Azul (`#2196F3`) | Árboles caídos u obstruyendo vías |
| **Baches/Semáforos** | 🚧 | Naranja (`#FF5722`) | Infraestructura vial dañada |
| **Obras Públicas** | 🚧 | Naranja (`#FF5722`) | Problemas en servicios municipales |

## 📁 Estructura del Proyecto
```
sirse-app/
├── app/                          # Navegación con Expo Router
│   ├── (tabs)/                   # Navegación por pestañas
│   │   ├── index.tsx             # 🗺️ Pantalla del mapa interactivo
│   │   ├── explore.tsx           # 📋 Feed de reportes
│   │   └── _layout.tsx           # Configuración de tabs
│   ├── report/
│   │   └── [id].tsx              # 📄 Detalle individual del reporte
│   ├── contact.tsx               # 📞 Información de contacto
│   ├── modal.tsx                 # ➕ Modal (reservado para futuro)
│   └── _layout.tsx               # Layout raíz de la app
│
├── components/                   # Componentes reutilizables
│   ├── CategoryBadge.tsx         # 🏷️ Badge visual de categoría
│   ├── StatusBadge.tsx           # 🔴 Badge de estado (Urgente/En proceso)
│   ├── ReportCard.tsx            # 📇 Tarjeta de reporte para listas
│   └── DrawerMenu.tsx            # ☰ Menú lateral de navegación
│
├── data/                         # Datos y definiciones
│   └── mockReports.ts            # 📊 Datos estáticos (temporal)
│
├── services/                     # Capa de servicios
│   └── reportService.ts          # 🔌 Servicio de API de reportes
│
├── assets/                       # Recursos multimedia
│   ├── images/                   # Imágenes e iconos
│   └── fonts/                    # Fuentes personalizadas
│
├── constants/                    # Constantes globales
│   └── Colors.ts                 # Paleta de colores
│
├── app.json                      # Configuración de Expo
├── package.json                  # Dependencias del proyecto
└── tsconfig.json                 # Configuración de TypeScript
```

## 🚀 Instalación y Configuración

### Requisitos Previos

#### Hardware Mínimo
- **Dispositivo móvil**:
  - Android 8.0 o superior
  - 2 GB RAM o superior
  - Procesador Quad-core o superior
  - GPS y conexión a Internet

#### Software de Desarrollo
- Node.js 18+ y npm/yarn
- Git
- Android Studio (para emulador) o dispositivo físico
- Expo Go app (para testing en dispositivo real)

### Pasos de Instalación

#### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/sirse-mobile.git
cd sirse-mobile
```

#### 2. Instalar dependencias
```bash
npm install
# o
yarn install
```

#### 3. Instalar Expo Router y dependencias adicionales
```bash
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
```

#### 4. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:
```env
# API Backend
API_BASE_URL=https://api.sirse.tulancingo.gob.mx

# Google Maps API (si se usa)
GOOGLE_MAPS_API_KEY=tu_api_key_aqui

# Entorno
ENVIRONMENT=development
```

#### 5. Iniciar el servidor de desarrollo
```bash
npx expo start
```

#### 6. Ejecutar en dispositivo

**Opción A: Dispositivo físico con Expo Go**
1. Instala **Expo Go** desde Google Play Store
2. Escanea el código QR que aparece en la terminal
3. La app se cargará automáticamente

**Opción B: Emulador Android**
```bash
# En la terminal de Expo, presiona 'a'
# O ejecuta directamente:
npx expo start --android
```

**Opción C: Emulador iOS (solo macOS)**
```bash
# En la terminal de Expo, presiona 'i'
# O ejecuta directamente:
npx expo start --ios
```

## 🎨 Pantallas de la Aplicación

### 1️⃣ Pantalla de Mapa (`app/(tabs)/index.tsx`)

**Funcionalidades:**
- Mapa interactivo con grid de navegación
- Marcadores de reportes por categoría
- Indicador de ubicación del usuario
- Botones de control (filtros, centrar ubicación)
- Leyenda de categorías
- Botón FAB para futuras funcionalidades
```typescript
// Ejemplo de uso del mapa
<View style={styles.mapContainer}>
  {/* Grid del mapa */}
  <View style={styles.mapGrid}>
    {/* Marcadores de reportes */}
    {reports.map((report) => (
      <CategoryBadge 
        key={report.id}
        category={report.category}
        onPress={() => navigateToReport(report.id)}
      />
    ))}
  </View>
</View>
```

### 2️⃣ Feed de Reportes (`app/(tabs)/explore.tsx`)

**Funcionalidades:**
- Lista scrollable de reportes
- Filtros: Todos | Recientes | Cerca de ti | En proceso
- Tarjetas informativas con:
  - Categoría visual
  - Título del incidente
  - Ubicación
  - Tiempo transcurrido
  - Distancia desde ubicación actual
  - Badge de estado (si es urgente)
```typescript
<ReportCard
  report={report}
  onPress={() => router.push(`/report/${report.id}`)}
/>
```

### 3️⃣ Detalle de Reporte (`app/report/[id].tsx`)

**Funcionalidades:**
- Imagen del incidente (si está disponible)
- Información completa del reporte
- Estado actual (Urgente/En proceso/Pendiente)
- Fecha y hora del reporte
- Ubicación precisa
- Descripción detallada
- Botones de acción:
  - 📤 Compartir reporte
  - 💾 Guardar para seguimiento

### 4️⃣ Menú Lateral (`components/DrawerMenu.tsx`)

**Opciones de navegación:**
- 🏠 Inicio (Mapa)
- 📋 Feed de Reportes
- 📞 Contacto
- ℹ️ Información de la app
- 📱 Footer con versión

## 🔌 Integración con API Backend

### Estructura del Servicio
```typescript
// services/reportService.ts

export const ReportService = {
  // Obtener todos los reportes
  getAllReports: async (filters?: {
    category?: string;
    status?: string;
  }): Promise<Report[]> => {
    // TODO: Reemplazar con llamada real a API
    const response = await fetch(
      `${API_BASE_URL}/api/reports?${queryParams}`
    );
    return response.json();
  },

  // Obtener reporte por ID
  getReportById: async (id: string): Promise<Report> => {
    const response = await fetch(
      `${API_BASE_URL}/api/reports/${id}`
    );
    return response.json();
  }
};
```

### Endpoints Esperados

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/reports` | Lista de reportes con filtros opcionales |
| `GET` | `/api/reports/:id` | Detalle de un reporte específico |
| `GET` | `/api/reports/nearby` | Reportes cercanos a coordenadas |
| `GET` | `/api/reports/heatmap` | Datos para mapa de calor |

### Formato de Datos (Report Interface)
```typescript
interface Report {
  id: string;
  title: string;
  category: 'Luminarias' | 'Limpieza' | 'Podas y Cortes' | 
            'Baches/Semáforos' | 'Obras Públicas';
  location: string;
  timestamp: string;          // "Hace 15 min"
  distance: string;           // "0.5 km de distancia"
  status: 'Urgente' | 'En proceso' | 'Pendiente';
  coordinates: {
    latitude: number;
    longitude: number;
  };
  description: string;
  image: string | null;       // URL de imagen
  reportedAt: string;         // "15 Oct 2025 - 14:35"
}
```

## 🎨 Guía de Estilos

### Paleta de Colores
```javascript
// constants/Colors.ts
export const Colors = {
  primary: '#2196F3',        // Azul principal
  background: '#F5F5F5',     // Gris claro de fondo
  white: '#FFFFFF',
  text: {
    primary: '#212121',
    secondary: '#757575',
  },
  categories: {
    luminarias: '#FFC107',
    limpieza: '#4CAF50',
    podas: '#2196F3',
    baches: '#FF5722',
  },
  status: {
    urgente: '#FF5252',
    proceso: '#FF9800',
    pendiente: '#9E9E9E',
  }
};
```

### Tipografía

- **Títulos**: 18-24px, peso 600-700
- **Texto normal**: 14-16px, peso 400-500
- **Texto pequeño**: 12-13px, peso 400

## 📦 Build y Deployment

### Generar APK de Desarrollo
```bash
# Configurar EAS Build
npm install -g eas-cli
eas login
eas build:configure

# Crear build de desarrollo
eas build --profile development --platform android
```

### Generar APK de Producción
```bash
# Build para Google Play Store
eas build --profile production --platform android
```

### Configuración de Build (`eas.json`)
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

## 🧪 Testing
```bash
# Ejecutar tests unitarios
npm test

# Tests con cobertura
npm run test:coverage

# Tests de componentes
npm run test:components
```

## 📱 Requisitos de Usuario Final

### Hardware Mínimo del Dispositivo
- **Sistema Operativo**: Android 8.0 (Oreo) o superior
- **RAM**: 2 GB mínimo (recomendado 3 GB)
- **Procesador**: Quad-core 1.3 GHz o superior
- **Almacenamiento libre**: 100 MB
- **GPS**: Requerido para funciones de ubicación
- **Cámara**: No requerida (la app solo consulta)
- **Internet**: Conexión 3G/4G/5G o WiFi (5 Mbps mínimo)

### Permisos Requeridos
- 📍 **Ubicación**: Para mostrar reportes cercanos
- 🌐 **Internet**: Para cargar datos y mapas
- 🔔 **Notificaciones**: Para recibir alertas (opcional)

## 🔒 Privacidad y Seguridad

### Cumplimiento Legal
✅ **Ley Federal de Protección de Datos Personales (LFPDPPP)**  
✅ **Ley General de Protección de Datos (LGPDPPSO)**  
✅ **Derechos ARCO** (Acceso, Rectificación, Cancelación, Oposición)

### Datos Recopilados
La aplicación móvil recopila **mínimos datos**:
- ✅ Ubicación del dispositivo (solo cuando se usa la app)
- ✅ Email (opcional, solo para notificaciones)
- ❌ **NO** recopila datos personales identificables
- ❌ **NO** requiere registro obligatorio

### Seguridad Implementada
- 🔒 Comunicación cifrada (HTTPS/TLS)
- 🔒 Anonimización de reportes públicos
- 🔒 Sin almacenamiento local de datos sensibles
- 🔒 Tokens de sesión seguros

## 🐛 Solución de Problemas

### Error: "Unable to connect to development server"
```bash
# Solución 1: Reiniciar servidor
npx expo start -c

# Solución 2: Verificar conexión
# Asegúrate de que el móvil y PC estén en la misma red WiFi

# Solución 3: Usar túnel
npx expo start --tunnel
```

### Error: "Module not found"
```bash
# Limpiar caché e reinstalar
rm -rf node_modules
npm install
npx expo start -c
```

### La app se cierra inesperadamente
```bash
# Ver logs en tiempo real
npx expo start
# Luego presiona 'j' para abrir debugger

# O conecta logcat para Android
adb logcat *:S ReactNative:V ReactNativeJS:V
```

## 📞 Soporte y Contacto

### Reportar Problemas
- **GitHub Issues**: [github.com/tu-usuario/sirse-mobile/issues](https://github.com/tu-usuario/sirse-mobile/issues)
- **Email**: soporte@sirse.tulancingo.gob.mx

### Contacto Institucional
- **Teléfono Emergencias**: 911
- **Oficina Municipal**: (775) 123-4567
- **Sitio Web**: [www.tulancingo.gob.mx](https://www.tulancingo.gob.mx)

### Para Ciudadanos
Si eres ciudadano y necesitas **reportar un incidente**, usa el **Chatbot de WhatsApp** de SIRSE. Esta app es solo de consulta.

## 👥 Créditos

**Universidad Tecnológica de Tulancingo**  
Ingeniería en Desarrollo y Gestión de Software

**Desarrollado para:**  
H. Ayuntamiento de Tulancingo de Bravo, Hidalgo

**Con el apoyo de:**
- Mtro. Netzer Gabriel Díaz Jaime - Director CIAPEM A.C.
- Lic. Luis Armando Granillo Islas - Jefatura de Seguimiento
- Lic. Héctor Alfaro Mellado - Primera Oficialía de Partes

## 📄 Licencia

Este proyecto es propiedad del **H. Ayuntamiento de Tulancingo de Bravo, Hidalgo**.

Desarrollado bajo licencia académica por la Universidad Tecnológica de Tulancingo.

---

<div align="center">
  <strong>Hecho con ❤️ para la ciudadanía de Tulancingo</strong>
  <br>
  <sub>© 2025 SIRSE Mobile - v1.0.0</sub>
  <br><br>
  <img src="https://img.shields.io/badge/Made%20in-Tulancingo%2C%20Hidalgo-blue?style=flat-square" />
</div>
