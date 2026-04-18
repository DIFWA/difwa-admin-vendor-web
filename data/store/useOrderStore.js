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
                
                // Silent refresh for stats and total count sync
                const statusFilter = get().filterStatus;
                const freshData = await retailerService.getOrders(null, get().currentPage, get().limit, statusFilter);
                if (freshData.success) {
                    set({
                        orders: freshData.data.orders || [],
                        stats: freshData.data.stats
                    });
                }
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
                // Optimistically update locally
                set(state => ({
                    orders: state.orders.map(o => 
                        (o._id === orderId || o.id === orderId) ? { ...o, status: 'Rider Assigned' } : o
                    )
                }));
                // Silent refresh for full sync
                const statusFilter = get().filterStatus;
                const freshData = await retailerService.getOrders(null, get().currentPage, get().limit, statusFilter);
                if (freshData.success) {
                    set({
                        orders: freshData.data.orders || [],
                        stats: freshData.data.stats
                    });
                }
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
        socket.on("orderUpdate", async (data) => {
            console.log("⚡ Real-time Order Update in Store:", data);
            
            const currentOrders = get().orders;
            const existingOrder = currentOrders.find(o => o._id === data.orderId || o.id === data.orderId);
            const oldStatus = existingOrder?.status;
            const newStatus = data.status;

            // 1. Optimistically update the order in the current list
            set(state => ({
                orders: state.orders.map(o => 
                    (o._id === data.orderId || o.id === data.orderId) 
                        ? { ...o, status: newStatus, rider: data.rider || o.rider } 
                        : o
                )
            }));

            // 2. Optimistically update the stats boxes
            if (oldStatus !== newStatus && get().stats) {
                const isPending = (s) => ['Pending', 'Accepted', 'Processing', 'Preparing', 'Shipped', 'Out for Delivery', 'Rider Assigned', 'Rider Accepted'].includes(s);
                const isCompleted = (s) => ['Delivered', 'Completed'].includes(s);

                set(state => {
                    const newStats = { ...state.stats };
                    
                    // If it was pending and now it's completed
                    if (isPending(oldStatus) && isCompleted(newStatus)) {
                        newStats.pendingOrders = Math.max(0, (newStats.pendingOrders || 0) - 1);
                        newStats.completedOrders = (newStats.completedOrders || 0) + 1;
                    }
                    // If it was something else and now it's pending (unlikely but safe to have)
                    else if (!isPending(oldStatus) && isPending(newStatus)) {
                        newStats.pendingOrders = (newStats.pendingOrders || 0) + 1;
                    }

                    return { stats: newStats };
                });
            }

            // 3. Silent Sync with backend
            try {
                const statusFilter = get().filterStatus;
                const res = await retailerService.getOrders(null, get().currentPage, get().limit, statusFilter);
                if (res.success) {
                    set({
                        orders: res.data.orders || [],
                        totalCount: res.data.pagination?.totalOrders || 0,
                        totalPages: res.data.pagination?.totalPages || 1,
                        stats: res.data.stats
                    });
                }
            } catch (err) {
                console.error("Silent refresh failed", err);
            }
        });

        socket.off("NEW_ORDER");
        socket.on("NEW_ORDER", async (data) => {
            console.log("🔥 NEW ORDER Received:", data);

            // 1. Optimistically bump the total and pending counts
            if (get().stats) {
                set(state => ({
                    stats: {
                        ...state.stats,
                        totalOrders: (state.stats.totalOrders || 0) + 1,
                        pendingOrders: (state.stats.pendingOrders || 0) + 1
                    }
                }));
            }

            // 2. Refresh list and stats from server
            try {
                const statusFilter = get().filterStatus;
                const res = await retailerService.getOrders(null, get().currentPage, get().limit, statusFilter);
                if (res.success) {
                    set({
                        orders: res.data.orders || [],
                        totalCount: res.data.pagination?.totalOrders || 0,
                        totalPages: res.data.pagination?.totalPages || 1,
                        stats: res.data.stats
                    });
                }
            } catch (err) {
                console.error("Silent refresh on new order failed", err);
            }
        });
    }
}));

export default useOrderStore;
