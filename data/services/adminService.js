import apiClient from "../api/apiClient";
import { API_ENDPOINTS } from "../api/apiEndPoint";

const adminService = {
    getDashboardStats: async () => {
        const response = await apiClient.get("/admin/dashboard-stats");
        return response.data;
    },

    getOrders: async (params = {}) => {
        const response = await apiClient.get("/admin/orders", { params });
        return response.data;
    },

    getAllTransactions: async (params = {}) => {
        const response = await apiClient.get(API_ENDPOINTS.ADMIN.TRANSACTIONS, { params });
        return response.data;
    },

    globalSearch: async (q) => {
        const response = await apiClient.get(API_ENDPOINTS.ADMIN.SEARCH, { params: { q } });
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

    deleteRetailer: async (id) => {
        const response = await apiClient.delete(`/admin/retailers/${id}`);
        return response.data;
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
    getPayouts: async (page = 1, limit = 10, search = "", date = "") => {
        const response = await apiClient.get("/payout/all", { params: { page, limit, search, date } });
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

    updateAdminProfile: async (email) => {
        const response = await apiClient.put("/admin/profile", { email });
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await apiClient.post("/admin/forgot-password", { email });
        return response.data;
    },

    resetPassword: async (email, otp, newPassword) => {
        const response = await apiClient.post("/admin/reset-password", { email, otp, newPassword });
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
    },

    // Admin User Management
    getAdmins: async () => {
        const response = await apiClient.get("/admin/admins");
        return response.data;
    },

    updateAdminUser: async (id, data) => {
        const response = await apiClient.put(`/admin/admins/${id}`, data);
        return response.data;
    },

    deleteAdmin: async (id) => {
        const response = await apiClient.delete(`/admin/admins/${id}`);
        return response.data;
    },

    // ── Delivery Charge Management ───────────────────────────────────────────
    getDeliveryChargeSettings: async () => {
        const response = await apiClient.get("/delivery-charge/settings");
        return response.data;
    },

    updateDeliveryChargeSettings: async (slabs, maxDeliveryKm, note = "", retailerSlabOptions) => {
        const response = await apiClient.put("/delivery-charge/settings", { slabs, maxDeliveryKm, note, retailerSlabOptions });
        return response.data;
    },

    updateRetailerSlabOptions: async (retailerSlabOptions) => {
        const response = await apiClient.put("/delivery-charge/retailer-slab-options", { retailerSlabOptions });
        return response.data;
    },

    toggleRetailerDeliveryPermission: async (retailerId) => {
        const response = await apiClient.patch(`/delivery-charge/retailer-permission/${retailerId}`);
        return response.data;
    },

    getDeliveryIncomeReport: async (params = {}) => {
        const response = await apiClient.get("/delivery-charge/income", { params });
        return response.data;
    }
};


export default adminService;
