// Imports
import API from "./api";

// Audit API Service
export const auditService = {
  // Fetch paginated, filterable audit logs
  getAuditLogs: async (params = {}) => {
    try {
      const res = await API.get("/admin/audit", { params });
      return res.data;
    } catch (error) {
      console.error("Error fetching system audit logs:", error.response?.data || error.message);
      throw error;
    }
  },

  // Fetch threat radar stats & recent alerts
  getAuditStats: async () => {
    try {
      const res = await API.get("/admin/audit/stats");
      return res.data;
    } catch (error) {
      console.error("Error fetching audit statistics:", error.response?.data || error.message);
      throw error;
    }
  },
};
