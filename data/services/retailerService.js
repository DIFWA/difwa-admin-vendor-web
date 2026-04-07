import apiClient from "../api/apiClient";
import { API_ENDPOINTS } from "../api/apiEndPoint";

const retailerService = {
    getDashboardStats: async () => {
        const response = await apiClient.get(API_ENDPOINTS.RETAILER.DASHBOARD_STATS);
        return response.data;
    },

    getOrders: async (customerId = null, page = 1, limit = 10, statusFilter = 'All') => {
        const response = await apiClient.get(API_ENDPOINTS.RETAILER.ORDERS, {
            params: { customerId, page, limit, statusFilter }
        });
        
        // Handle the paginated object structure from backend
        const ordersRaw = response.data.data?.orders || response.data.orders || [];
        
        if (response.data.success && Array.isArray(ordersRaw)) {
            const mappedOrders = ordersRaw.map((order) => ({
                id: order.id || order.orderId,
                _id: order._id,
                date: order.date || new Date(order.createdAt).toLocaleDateString(),
                product: order.product || (order.items?.map(i => `${i.quantity}x ${i.product?.name || 'Product'}`).join(', ')) || 'No products',
                price: order.price || order.totalAmount || 0,
                status: order.status,
                payment: order.payment || order.paymentStatus,
                orderType: order.orderType,
                rider: order.rider,
                statusHistory: order.statusHistory || [],
                items: order.items || [],
                user: order.user || null,
                deliveryAddress: order.deliveryAddress || null,
                deliverySlot: order.deliverySlot || null
            }));
            
            if (response.data.data?.orders) {
                response.data.data.orders = mappedOrders;
            } else if (response.data.orders) {
                response.data.orders = mappedOrders;
            }
        }
        return response.data;
    },

    updateOrderStatus: async (orderId, status) => {
        const response = await apiClient.patch(API_ENDPOINTS.RETAILER.ORDER_STATUS, { orderId, status });
        return response.data;
    },

    getReviews: async () => {
        const response = await apiClient.get(API_ENDPOINTS.RETAILER.REVIEWS);
        return response.data;
    },

    getRevenueStats: async (range = 'month', startDate = null, endDate = null) => {
        const response = await apiClient.get(API_ENDPOINTS.RETAILER.REVENUE_STATS, { 
            params: { range, startDate, endDate } 
        });
        return response.data;
    },

    getCustomers: async () => {
        const response = await apiClient.get(API_ENDPOINTS.RETAILER.CUSTOMERS);
        return response.data;
    },

    getCategories: async () => {
        const response = await apiClient.get(API_ENDPOINTS.RETAILER.CATEGORIES);
        return response.data;
    },

    // Products
    getProducts: async () => {
        const response = await apiClient.get(API_ENDPOINTS.RETAILER.PRODUCTS);
        return response.data;
    },

    getProduct: async (id) => {
        const response = await apiClient.get(`${API_ENDPOINTS.RETAILER.PRODUCTS}/${id}`);
        return response.data;
    },

    createProduct: async (productData) => {
        const response = await apiClient.post(API_ENDPOINTS.RETAILER.PRODUCTS, productData);
        return response.data;
    },

    updateProduct: async (id, productData) => {
        const response = await apiClient.put(`${API_ENDPOINTS.RETAILER.PRODUCTS}/${id}`, productData);
        return response.data;
    },

    deleteProduct: async (id) => {
        const response = await apiClient.delete(`${API_ENDPOINTS.RETAILER.PRODUCTS}/${id}`);
        return response.data;
    },

    // Profile & Settings
    getProfile: async (userId) => {
        const response = await apiClient.get(`${API_ENDPOINTS.AUTH.ME}/${userId}`);
        return response.data;
    },

    updateProfile: async (profileData) => {
        const response = await apiClient.put(API_ENDPOINTS.RETAILER.PROFILE, profileData);
        return response.data;
    },

    // Payouts
    requestPayout: async (payoutData) => {
        const response = await apiClient.post(API_ENDPOINTS.PAYOUT.REQUEST, payoutData);
        return response.data;
    },

    getPayoutHistory: async () => {
        const response = await apiClient.get(API_ENDPOINTS.PAYOUT.MY_HISTORY);
        return response.data;
    },

    // Shop Status
    toggleShopStatus: async () => {
        const response = await apiClient.patch(API_ENDPOINTS.RETAILER.TOGGLE_STATUS);
        return response.data;
    },

    getPrepList: async (date) => {
        const response = await apiClient.get(API_ENDPOINTS.RETAILER.PREP_LIST, { params: { date } });
        return response.data;
    },

    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await apiClient.post(API_ENDPOINTS.UPLOAD.IMAGE, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    },

    // Riders
    getRiders: async () => {
        const response = await apiClient.get(API_ENDPOINTS.RIDER.RETAILER);
        return response.data;
    },

    addRider: async (riderData) => {
        const response = await apiClient.post(API_ENDPOINTS.RIDER.ADD, riderData);
        return response.data;
    },

    updateRiderStatus: async (riderId, status) => {
        const response = await apiClient.patch(`${API_ENDPOINTS.RIDER.RETAILER}/${riderId}/status`, { status });
        return response.data;
    },

    assignRider: async (orderId, riderId) => {
        const response = await apiClient.post(API_ENDPOINTS.RETAILER.ASSIGN_RIDER, { orderId, riderId });
        return response.data;
    },

    updateRider: async (riderId, riderData) => {
        const response = await apiClient.patch(`${API_ENDPOINTS.RIDER.RETAILER}/${riderId}`, riderData);
        return response.data;
    },

    deleteRider: async (riderId) => {
        const response = await apiClient.delete(`${API_ENDPOINTS.RIDER.RETAILER}/${riderId}`);
        return response.data;
    },

    addManualCustomer: async (customerData) => {
        const response = await apiClient.post(API_ENDPOINTS.RETAILER.CUSTOMERS, customerData);
        return response.data;
    },

    createManualOrder: async (orderData) => {
        const response = await apiClient.post(API_ENDPOINTS.RETAILER.ORDERS_MANUAL, orderData);
        return response.data;
    },

    settleCustomerDue: async (customerId, amount) => {
        const response = await apiClient.post(API_ENDPOINTS.RETAILER.CUSTOMERS_SETTLE_DUE, { customerId, amount });
        return response.data;
    },

    createManualSubscription: async (subscriptionData) => {
        const response = await apiClient.post(API_ENDPOINTS.RETAILER.SUBSCRIPTIONS_MANUAL, subscriptionData);
        return response.data;
    },

    getRetailerSubscriptions: async (customerId) => {
        const baseUrl = API_ENDPOINTS.RETAILER.SUBSCRIPTIONS;
        const url = customerId ? `${baseUrl}?customerId=${customerId}` : baseUrl;
        const response = await apiClient.get(url);
        return response.data;
    },
    
    searchAnything: async (query) => {
        const response = await apiClient.get(API_ENDPOINTS.RETAILER.SEARCH, { params: { q: query } });
        return response.data;
    },

    getDueOrdersForCustomer: async (customerId) => {
        const response = await apiClient.get(`${API_ENDPOINTS.RETAILER.CUSTOMERS}/${customerId}/due-orders`);
        return response.data;
    },

    bulkProcessOrders: async () => {
        const response = await apiClient.post(API_ENDPOINTS.RETAILER.BULK_PROCESS_ORDERS);
        return response.data;
    }
};

export default retailerService;
