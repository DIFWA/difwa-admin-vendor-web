import apiClient from "../api/apiClient";

const retailerService = {
    getDashboardStats: async () => {
        const response = await apiClient.get("/retailer/dashboard-stats");
        return response.data;
    },

    getOrders: async (customerId = null) => {
        const response = await apiClient.get("/retailer/orders", {
            params: { customerId }
        });
        return response.data;
    },

    updateOrderStatus: async (orderId, status) => {
        const response = await apiClient.patch("/retailer/order-status", { orderId, status });
        return response.data;
    },

    getReviews: async () => {
        const response = await apiClient.get("/retailer/reviews");
        return response.data;
    },

    getRevenueStats: async () => {
        const response = await apiClient.get("/retailer/revenue-stats");
        return response.data;
    },

    getCustomers: async () => {
        const response = await apiClient.get("/retailer/customers");
        return response.data;
    },

    getCategories: async () => {
        const response = await apiClient.get("/retailer/categories");
        return response.data;
    },

    // Products
    getProducts: async () => {
        const response = await apiClient.get("/retailer/products");
        return response.data;
    },

    getProduct: async (id) => {
        const response = await apiClient.get(`/retailer/products/${id}`);
        return response.data;
    },

    createProduct: async (productData) => {
        const response = await apiClient.post("/retailer/products", productData);
        return response.data;
    },

    updateProduct: async (id, productData) => {
        const response = await apiClient.put(`/retailer/products/${id}`, productData);
        return response.data;
    },

    deleteProduct: async (id) => {
        const response = await apiClient.delete(`/retailer/products/${id}`);
        return response.data;
    },

    // Profile & Settings
    getProfile: async (userId) => {
        const response = await apiClient.get(`/auth/me/${userId}`);
        return response.data;
    },

    updateProfile: async (profileData) => {
        const response = await apiClient.put("/retailer/profile", profileData);
        return response.data;
    },

    // Payouts
    requestPayout: async (payoutData) => {
        const response = await apiClient.post("/payout/request", payoutData);
        return response.data;
    },

    getPayoutHistory: async () => {
        const response = await apiClient.get("/payout/my-history");
        return response.data;
    },

    // Shop Status
    toggleShopStatus: async () => {
        const response = await apiClient.patch("/retailer/toggle-status");
        return response.data;
    },

    getPrepList: async (date) => {
        const response = await apiClient.get("/retailer/prep-list", { params: { date } });
        return response.data;
    },

    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await apiClient.post("/upload/image", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    },

    // Riders
    getRiders: async () => {
        const response = await apiClient.get("/rider/retailer");
        return response.data;
    },

    addRider: async (riderData) => {
        const response = await apiClient.post("/rider/add", riderData);
        return response.data;
    },

    updateRiderStatus: async (riderId, status) => {
        const response = await apiClient.patch(`/rider/retailer/${riderId}/status`, { status });
        return response.data;
    },

    assignRider: async (orderId, riderId) => {
        const response = await apiClient.post("/retailer/assign-rider", { orderId, riderId });
        return response.data;
    },

    updateRider: async (riderId, riderData) => {
        const response = await apiClient.patch(`/rider/retailer/${riderId}`, riderData);
        return response.data;
    },

    deleteRider: async (riderId) => {
        const response = await apiClient.delete(`/rider/retailer/${riderId}`);
        return response.data;
    }
};

export default retailerService;
