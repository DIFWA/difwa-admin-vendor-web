import { create } from 'zustand';
import { io } from 'socket.io-client';
import useOrderStore from './useOrderStore';
import useProductStore from './useProductStore';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

const useSocketStore = create((set, get) => ({
    socket: null,
    connected: false,

    connect: (userId) => {
        // Already connected — don't create a second socket
        if (get().socket?.connected) return;

        const socket = io(SOCKET_URL, {
            headers: { "ngrok-skip-browser-warning": "true" },
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
        });

        socket.on('connect', () => {
            console.log('🟢 Socket Connected:', socket.id);
            set({ connected: true });
            if (userId) {
                socket.emit('join', `retailer_${userId}`);
                console.log(`📡 Joined room: retailer_${userId}`);
            }
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
                                        ? { name: orderData.riderName }
                                        : (orderData?.rider || o.rider),
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
