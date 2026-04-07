import { create } from 'zustand';
import retailerService from '../services/retailerService';
import socketService from '../socket';

const useOrderStore = create((set, get) => ({
    orders: [],
    loading: false,
    error: null,
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
    filterStatus: 'all',
    stats: null,

    setFilterStatus: (status) => set({ filterStatus: status }),

    fetchOrders: async (page = 1, customerId = null, force = false, statusFilter = 'All') => {
        // Skip if data for this page is already loaded and not forcing a refresh
        if (get().orders.length > 0 && !force && !customerId && get().currentPage === page && get().filterStatus === statusFilter) return;
        
        set({ loading: true, error: null, filterStatus: statusFilter });
        try {
            const res = await retailerService.getOrders(customerId, page, get().limit, statusFilter);
            if (res.success) {
                set({
                    orders: res.data.orders || [],
                    totalCount: res.data.pagination?.totalOrders || 0,
                    totalPages: res.data.pagination?.totalPages || 1,
                    currentPage: res.data.pagination?.currentPage || page,
                    stats: res.data.stats,
                    loading: false
                });
            }
        } catch (err) {
            console.error("Fetch orders failed", err);
            set({ error: err.message, loading: false });
        }
    },

    updateOrderStatus: async (orderId, status) => {
        try {
            const res = await retailerService.updateOrderStatus(orderId, status);
            if (res.success) {
                set(state => ({
                    orders: state.orders.map(o => 
                        (o._id === orderId || o.id === orderId) ? { ...o, status } : o
                    )
                }));
                return res;
            }
        } catch (err) {
            console.error("Update order status failed", err);
            throw err;
        }
    },

    assignRider: async (orderId, riderId) => {
        try {
            const res = await retailerService.assignRider(orderId, riderId);
            if (res.success) {
                // After manual assignment, we force-refresh the current page
                await get().fetchOrders(get().currentPage, null, true);
                return res;
            }
        } catch (err) {
            console.error("Assign rider failed", err);
            throw err;
        }
    },

    createManualOrder: async (orderData) => {
        try {
            const res = await retailerService.createManualOrder(orderData);
            if (res.success) {
                await get().fetchOrders(1, null, true);
                return res;
            }
        } catch (err) {
            throw err;
        }
    },

    initSocketListeners: (userId) => {
        if (!userId) return;
        
        const socket = socketService.getSocket();
        if (!socket) return;

        socket.off("orderUpdate"); // Remove existing
        socket.on("orderUpdate", (data) => {
            console.log("⚡ Real-time Order Update in Store:", data);
            // Refresh current page to get accurate state and stats
            get().fetchOrders(get().currentPage, null, true);
        });
    }
}));

export default useOrderStore;
