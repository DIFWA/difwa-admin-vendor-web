import apiClient from "../api/apiClient";

const retailerService = {
    getCategories: async () => {
        const response = await apiClient.get("/retailer/categories");
        return response.data;
    }
};

export default retailerService;
