import { create } from 'zustand';
import retailerService from '../services/retailerService';
import socketService from '../socket';

const useOrderStore = create((set, get) => ({
    orders: [],
    loading: false,
    error: null,
    totalCount: 0,
    filterStatus: 'all',

    setFilterStatus: (status) => set({ filterStatus: status }),

    fetchOrders: async (customerId = null, force = false) => {
        // Skip if data is already loaded and not forcing a refresh
        if (get().orders.length > 0 && !force && !customerId) return;
        
        set({ loading: true, error: null });
        try {
            const res = await retailerService.getOrders(customerId);
            if (res.success) {
                // Determine order list based on single user or list
                const ordersRaw = Array.isArray(res.data) ? res.data : (res.data.orders || []);
                set({ orders: ordersRaw, totalCount: ordersRaw.length, loading: false });
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
                await get().fetchOrders();
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
                await get().fetchOrders(null, true);
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

        const eventName = `retailer_${userId}`;
        
        socket.off("orderUpdate"); // Remove existing
        socket.on("orderUpdate", (data) => {
            console.log("⚡ Real-time Order Update in Store:", data);
            // Refresh orders from server to get accurate state
            get().fetchOrders(null, true);
        });
    }
}));

export default useOrderStore;
