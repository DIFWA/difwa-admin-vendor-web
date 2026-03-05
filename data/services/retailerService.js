import apiClient from "../api/apiClient";

const retailerService = {
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

export default retailerService;
