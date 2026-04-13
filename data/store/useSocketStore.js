import { create } from 'zustand';
import { io } from 'socket.io-client';
import useOrderStore from './useOrderStore';
import useProductStore from './useProductStore';
import useNotificationStore from './useNotificationStore';
import useRetailerStore from './useRetailerStore';
import useAdminStore from './useAdminStore';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://api.difwa.com';

const useSocketStore = create((set, get) => ({
    socket: null,
    connected: false,

    connect: (userId) => {
        const currentSocket = get().socket;

        // Case 1: Already have a socket
        if (currentSocket) {
            // Re-join rooms if we have a userId, even if already connected
            if (userId) {
                currentSocket.emit('join', `retailer_${userId}`);
                currentSocket.emit('join', `user_${userId}`);
                currentSocket.emit('join', `retailer_notifications_${userId}`);
                console.log(`📡 [Sync] Joined rooms for: ${userId}`);
            }

            // If disconnected, call connect()
            if (!currentSocket.connected) {
                currentSocket.connect();
            }
            return;
        }

        // Case 2: No socket - Create NEW connection
        const socket = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
        });

        socket.on('connect', () => {
            console.log('🟢 Socket Connected:', socket.id);
            set({ connected: true });
            if (userId) {
                // Determine user role (can be passed or checked from storage)
                const role = typeof window !== "undefined" ? localStorage.getItem("role") : null;
                
                socket.emit('join', `retailer_${userId}`);
                socket.emit('join', `user_${userId}`);
                socket.emit('join', `retailer_notifications_${userId}`);
                
                if (role === "admin") {
                    socket.emit('join', 'admin');
                    console.log(`📡 Joined admin room`);
                }
                
                console.log(`📡 Joined rooms for user: ${userId}`);
            }
        });

        // ─── Payout Updates: Real-time UI refresh ──────────────────────────
        socket.on('payoutUpdate', (payload) => {
            const { payoutId, status, data } = payload;
            console.log('⚡ payoutUpdate:', { payoutId, status });

            // Update Retailer Store
            if (useRetailerStore) {
                useRetailerStore.setState(state => ({
                    payouts: state.payouts.some(p => p._id === payoutId) 
                        ? state.payouts.map(p => p._id === payoutId ? { ...p, status, ...data } : p)
                        : [data, ...state.payouts]
                }));
            }

            // Update Admin Store
            if (useAdminStore) {
                useAdminStore.setState(state => {
                    if (!state.payoutsData) return state;
                    return {
                        payoutsData: {
                            ...state.payoutsData,
                            data: state.payoutsData.data.some(p => p._id === payoutId)
                                ? state.payoutsData.data.map(p => p._id === payoutId ? { ...p, status, ...data } : p)
                                : [data, ...state.payoutsData.data]
                        }
                    };
                });
            }
        });

        // ─── Notifications: Global App Alerts ───────────────────────────────
        socket.on('notification', (notification) => {
            console.log('🔔 notification:', notification);
            useNotificationStore.getState().addNotification(notification);
        });

        // ─── Order Updates: Patch in place, NO refetch ────────────────────────
        socket.on('orderUpdate', (payload) => {
            const { orderId, status, data: orderData } = payload;
            console.log('⚡ orderUpdate:', { orderId, status });

            // Helper to format date like "08-04, 01:19 pm"
            const formatOrderDate = (date) => {
                const d = new Date(date);
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                let hours = d.getHours();
                const minutes = String(d.getMinutes()).padStart(2, '0');
                const ampm = hours >= 12 ? 'pm' : 'am';
                hours = hours % 12;
                hours = hours ? hours : 12;
                return `${day}-${month}, ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
            };

            useOrderStore.setState(state => {
                const exists = state.orders.some(
                    o => o._id === orderId || o.id === orderId
                );

                if (exists) {
                    // Patch the existing order in place
                    return {
                        orders: state.orders.map(o =>
                            (o._id === orderId || o.id === orderId)
                                ? {
                                    ...o,
                                    status,
                                    statusHistory: orderData?.statusHistory || o.statusHistory,
                                    rider: orderData?.riderName
                                        ? { name: orderData.riderName, id: orderData.rider?.id || orderData.rider }
                                        : (typeof orderData?.rider === 'object' ? orderData.rider : (orderData?.rider ? { id: orderData.rider } : o.rider)),
                                    deliverySlot: orderData?.deliverySlot || o.deliverySlot
                                }
                                : o
                        )
                    };
                } else {
                    // New order — prepend it to the top of the list
                    if (orderData) {
                        const newOrder = {
                            _id: orderData._id,
                            id: orderData.orderId || orderId,
                            createdAt: orderData.createdAt, // KEEP RAW TIMESTAMP FOR INVOICE
                            date: formatOrderDate(orderData.createdAt),
                            product: orderData.items
                                ? orderData.items.map(i => `${i.quantity}x ${i.product?.name || 'Product'}`).join(', ')
                                : 'New Order',
                            price: orderData.totalAmount || '0',
                            status: orderData.status || status,
                            payment: orderData.paymentStatus,
                            orderType: orderData.orderType,
                            deliverySlot: orderData.deliverySlot,
                            rider: orderData.rider,
                            statusHistory: orderData.statusHistory,
                        };
                        return { orders: [newOrder, ...state.orders] };
                    }
                    return state;
                }
            });

            // Update Admin Store (if applicable)
            if (useAdminStore) {
                useAdminStore.setState(state => {
                    if (!state.ordersData) return state;
                    const orders = state.ordersData.data || [];
                    const exists = orders.some(o => o._id === orderId || o.orderId === orderId);

                    if (exists) {
                        return {
                            ordersData: {
                                ...state.ordersData,
                                data: orders.map(o => 
                                    (o._id === orderId || o.orderId === orderId) 
                                        ? { ...o, status, ...orderData } 
                                        : o
                                )
                            }
                        };
                    } else if (status === "Pending") {
                        // For new orders, we might want to refresh or prepend
                        // For now just keep it consistent
                        return state;
                    }
                    return state;
                });
            }
        });

        // ─── Product Updates: Patch in place, NO refetch ──────────────────────
        socket.on('productUpdate', (payload) => {
            const { action, product } = payload;
            console.log('⚡ productUpdate:', { action, productId: product?._id });

            useProductStore.setState(state => {
                if (action === 'created') {
                    // Prepend new product — avoid duplicates
                    const alreadyExists = state.products.some(p => p._id === product._id);
                    if (alreadyExists) return state;
                    return { products: [product, ...state.products] };
                }

                if (action === 'updated') {
                    // Patch the updated product in place
                    return {
                        products: state.products.map(p =>
                            p._id === product._id ? { ...p, ...product } : p
                        )
                    };
                }

                if (action === 'deleted') {
                    return {
                        products: state.products.filter(p => p._id !== product._id)
                    };
                }

                return state;
            });
        });

        // ─── Shop Status Updates ───────────────────────────────────────────
        socket.on('shopStatusUpdate', (payload) => {
            const { shopId, isShopActive } = payload;
            console.log('⚡ shopStatusUpdate:', { shopId, isShopActive });

            if (useAdminStore) {
                useAdminStore.setState(state => {
                    if (!state.retailersData) return state;
                    return {
                        retailersData: {
                            ...state.retailersData,
                            data: state.retailersData.data.map(r => 
                                r._id === shopId ? { ...r, isShopActive } : r
                            )
                        }
                    };
                });
            }
        });

        socket.on('disconnect', () => {
            console.log('🔴 Socket Disconnected');
            set({ connected: false });
        });

        socket.on('connect_error', (error) => {
            console.error('❌ Socket Error:', error.message);
            set({ connected: false });
        });

        set({ socket });
    },

    disconnect: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null, connected: false });
        }
    }
}));

export default useSocketStore;
