import { create } from 'zustand';
import { io } from 'socket.io-client';
import useOrderStore from './useOrderStore';
import useProductStore from './useProductStore';
import useNotificationStore from './useNotificationStore';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

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
                socket.emit('join', `retailer_${userId}`);
                socket.emit('join', `user_${userId}`);
                socket.emit('join', `retailer_notifications_${userId}`);
                console.log(`📡 Joined rooms for user: ${userId}`);
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
                            date: new Date(orderData.createdAt).toLocaleDateString(),
                            product: orderData.items
                                ? orderData.items.map(i => `${i.quantity}x ${i.product?.name || 'Product'}`).join(', ')
                                : 'New Order',
                            price: orderData.totalAmount,
                            status: orderData.status || status,
                            payment: orderData.paymentStatus,
                            orderType: orderData.orderType,
                            rider: orderData.rider,
                            statusHistory: orderData.statusHistory,
                        };
                        return { orders: [newOrder, ...state.orders] };
                    }
                    return state;
                }
            });
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
