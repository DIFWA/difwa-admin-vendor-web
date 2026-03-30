import apiClient from "../api/apiClient";

const adminService = {
    getDashboardStats: async () => {
        const response = await apiClient.get("/admin/dashboard-stats");
        return response.data;
    },

    getOrders: async (params = {}) => {
        const response = await apiClient.get("/admin/orders", { params });
        return response.data;
    },

    getRetailers: async (status = "under_review", page = 1, limit = 10, search = "") => {
        const response = await apiClient.get("/admin/retailers", {
            params: { status, page, limit, search }
        });
        return response.data;
    },

    getShops: async () => {
        const response = await apiClient.get("/admin/retailers", {
            params: { status: "all" }
        });
        return response.data;
    },

    updateRetailerStatus: async (userId, status, rejectionReason = "") => {
        const response = await apiClient.put("/admin/retailers/status", {
            userId,
            status,
            rejectionReason
        });
        return response.data.data;
    },

    getUsers: async (page = 1, limit = 10, search = "") => {
        const response = await apiClient.get("/admin/users", {
            params: { page, limit, search }
        });
        return response.data;
    },

    // Category Management
    getCategories: async (page = 1, limit = 10, search = "") => {
        const response = await apiClient.get("/admin/categories", {
            params: { page, limit, search }
        });
        return response.data;
    },

    createCategory: async (name, image = "") => {
        const response = await apiClient.post("/admin/categories", { name, image });
        return response.data;
    },

    updateCategory: async (id, name, image = "") => {
        const response = await apiClient.put(`/admin/categories/${id}`, { name, image });
        return response.data;
    },

    deleteCategory: async (id) => {
        const response = await apiClient.delete(`/admin/categories/${id}`);
        return response.data;
    },

    // // Subscription Management
    // getSubscriptionPlans: async () => {
    //     const response = await apiClient.get("/admin/subscriptions");
    //     return response.data;
    // },

    // createSubscriptionPlan: async (planData) => {
    //     const response = await apiClient.post("/admin/subscriptions", planData);
    //     return response.data;
    // },

    // updateSubscriptionPlan: async (id, planData) => {
    //     const response = await apiClient.put(`/admin/subscriptions/${id}`, planData);
    //     return response.data;
    // },

    // deleteSubscriptionPlan: async (id) => {
    //     const response = await apiClient.delete(`/admin/subscriptions/${id}`);
    //     return response.data;
    // },

    // Payout Management
    getPayouts: async () => {
        const response = await apiClient.get("/payout/all");
        return response.data;
    },

    approvePayout: async (payoutId, transactionId) => {
        const response = await apiClient.put(`/payout/approve/${payoutId}`, { transactionId });
        return response.data;
    },

    // Communication Management
    sendBulkNotification: async (title, body, targetType = 'all') => {
        const response = await apiClient.post("/communication/notify-all", { title, body, targetType });
        return response.data;
    },

    sendBulkEmail: async (subject, htmlContent) => {
        const response = await apiClient.post("/communication/email-all", { subject, htmlContent });
        return response.data;
    },

    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await apiClient.post("/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    },

    // Role Management
    getRoles: async () => {
        const response = await apiClient.get("/admin/roles");
        return response.data;
    },

    createRole: async (roleData) => {
        const response = await apiClient.post("/admin/roles", roleData);
        return response.data;
    },

    updateRole: async (id, roleData) => {
        const response = await apiClient.put(`/admin/roles/${id}`, roleData);
        return response.data;
    },

    deleteRole: async (id) => {
        const response = await apiClient.delete(`/admin/roles/${id}`);
        return response.data;
    },

    // Admin Invitation
    inviteAdmin: async (name, email, roleId) => {
        const response = await apiClient.post("/admin/invite", { name, email, roleId });
        return response.data;
    },

    changePassword: async (currentPassword, newPassword) => {
        const response = await apiClient.put("/admin/change-password", { currentPassword, newPassword });
        return response.data;
    },

    // Commission Management
    getCommissionSetting: async () => {
        const response = await apiClient.get("/commission");
        return response.data;
    },

    updateCommissionRate: async (rate, description = "", note = "") => {
        const response = await apiClient.put("/commission", { rate, description, note });
        return response.data;
    }
};

export default adminService;
