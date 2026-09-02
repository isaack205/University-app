// Imports
import API from "./api";

// Broadcast Service
export const broadcastService = {
  // Send broadcast announcement
  sendBroadcast: async (broadcastData) => {
    try {
      const res = await API.post("/admin/broadcast/send", broadcastData);
      return res.data;
    } catch (error) {
      console.error("Error sending broadcast announcement:", error.response?.data || error.message);
      throw error;
    }
  },

  // Search users for target picker
  searchUsers: async (query) => {
    try {
      const res = await API.get("/admin/broadcast/search-users", {
        params: { query },
      });
      return res.data;
    } catch (error) {
      console.error("Error searching users for broadcast:", error.response?.data || error.message);
      throw error;
    }
  },
};
