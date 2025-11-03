
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
        
        // Apply filters if provided
        if (filters?.category) {
          reports = reports.filter(r => r.category === filters.category);
        }
        if (filters?.status) {
          reports = reports.filter(r => r.status === filters.status);
        }
        
        resolve(reports);
      }, 500); // Simulate network delay
    });
    
    // TODO: Replace with real API call:
    // const response = await fetch(`${API_BASE_URL}/reports?${queryParams}`);
    // return response.json();
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
    
    // TODO: Replace with real API call:
    // const response = await fetch(`${API_BASE_URL}/reports/${id}`);
    // return response.json();
  },


};