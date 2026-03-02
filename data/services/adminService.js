import apiClient from "../api/apiClient";

const adminService = {
    getRetailers: async (status = "under_review", page = 1, limit = 10, search = "") => {
        const response = await apiClient.get("/admin/retailers", {
            params: { status, page, limit, search }
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

    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await apiClient.post("/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    }
};

export default adminService;
