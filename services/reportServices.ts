import { MOCK_REPORTS, Report } from '../data/mockReports';

/**
 * ReportService - Simulates API calls with static data
 * 
 * TODO: Replace with real API integration
 * - Change Promise.resolve() to actual fetch/axios calls
 * - Add error handling for network failures
 * - Implement authentication tokens if needed
 * - Add retry logic for failed requests
 */

export interface PaginationResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ReportFilters {
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
  simulateOffline?: boolean;
  simulateEmpty?: boolean;
}

// Interface para filtros geográficos
export interface GeographicBounds {
  northEast: {
    latitude: number;
    longitude: number;
  };
  southWest: {
    latitude: number;
    longitude: number;
  };
}

// ✅ ACTUALIZADA: Ahora con paginación
export interface AreaReportFilters {
  bounds: GeographicBounds;
  category?: string;
  status?: string;
  timeRange?: '24h' | '7d' | '30d';
  page?: number;           // ✅ NUEVO
  limit?: number;          // ✅ NUEVO
  simulateOffline?: boolean;
  simulateEmpty?: boolean;
}

export const ReportService = {
  /**
   * Fetch all reports with optional filters
   * 
   * @future API endpoint: GET /api/reports?category={category}&status={status}
   */
  getAllReports: async (filters?: { 
    category?: string; 
    status?: string;
  }): Promise<Report[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let reports = [...MOCK_REPORTS];
        
        if (filters?.category) {
          reports = reports.filter(r => r.category === filters.category);
        }
        if (filters?.status) {
          reports = reports.filter(r => r.status === filters.status);
        }
        
        resolve(reports);
      }, 500);
    });
  },

  /**
   * Fetch single report by ID
   * 
   * @future API endpoint: GET /api/reports/:id
   */
  getReportById: async (id: string): Promise<Report | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const report = MOCK_REPORTS.find(r => r.id === id);
        resolve(report);
      }, 300);
    });
  },

  /**
   * Fetch paginated reports with optional filters
   *
   * @future: /api/reports?page={page}&limit={limit}&category={category}&status={status}
   */
  getPaginatedReports: async (
    filters?: ReportFilters
  ): Promise<PaginationResult<Report>> => {
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {

        if (filters?.simulateOffline) {
          return reject({
            message: "No hay conexión a internet.",
            code: "OFFLINE"
          });
        }

        const page = filters?.page ?? 1;
        const limit = filters?.limit ?? 1;
        let reports = [...MOCK_REPORTS];

        if (filters?.simulateEmpty) {
          reports = [];
        }

        if (filters?.category) {
          reports = reports.filter(r => r.category === filters.category);
        }
        if (filters?.status) {
          reports = reports.filter(r => r.status === filters.status);
        }

        if (reports.length === 0) {
          return resolve({
            data: [],
            page,
            limit,
            total: 0,
            totalPages: 0,
            hasMore: false
          });
        }

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = reports.slice(startIndex, endIndex);

        const total = reports.length;
        const totalPages = Math.ceil(total / limit);
        const hasMore = page < totalPages;

        resolve({
          data: paginatedData,
          page,
          limit,
          total,
          totalPages,
          hasMore
        });

      }, 800);
    });
  },

  /**
   * ✅ ACTUALIZADO: Fetch reports within a geographic area (SIN paginación)
   * 
   * Usa este método cuando necesites TODOS los reportes del área
   * (por ejemplo, para generar mapas de calor o estadísticas completas)
   * 
   * @future API endpoint: POST /api/reports/by-area
   */
  getReportsByArea: async (
    filters: AreaReportFilters
  ): Promise<Report[]> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        
        if (filters.simulateOffline) {
          return reject({
            message: "No hay conexión a internet.",
            code: "OFFLINE"
          });
        }

        let reports = [...MOCK_REPORTS];

        if (filters.simulateEmpty) {
          return resolve([]);
        }

        // 1️⃣ Filtrar por área geográfica
        const { northEast, southWest } = filters.bounds;
        
        reports = reports.filter(report => {
          const lat = report.coordinates.latitude;
          const lng = report.coordinates.longitude;
          
          return (
            lat <= northEast.latitude &&
            lat >= southWest.latitude &&
            lng <= northEast.longitude &&
            lng >= southWest.longitude
          );
        });

        // 2️⃣ Filtrar por categoría
        if (filters.category) {
          reports = reports.filter(r => r.category === filters.category);
        }

        // 3️⃣ Filtrar por estado
        if (filters.status) {
          reports = reports.filter(r => r.status === filters.status);
        }

        // 4️⃣ Filtrar por rango de tiempo
        if (filters.timeRange) {
          const now = Date.now();
          let maxAge = 0;

          switch (filters.timeRange) {
            case '24h':
              maxAge = 24 * 60 * 60 * 1000;
              break;
            case '7d':
              maxAge = 7 * 24 * 60 * 60 * 1000;
              break;
            case '30d':
              maxAge = 30 * 24 * 60 * 60 * 1000;
              break;
          }

          reports = reports.filter(report => {
            const reportAge = now - report.reportedAtTimestamp;
            return reportAge <= maxAge;
          });
        }

        resolve(reports);

        console.log("Hola")

      }, 600);
    });
  },

};