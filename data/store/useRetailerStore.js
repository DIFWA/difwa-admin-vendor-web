import { create } from 'zustand';
import retailerService from '../services/retailerService';

const useRetailerStore = create((set, get) => ({
    // Dashboard Stats
    stats: null,
    revenueData: null,
    loading: false,

    // Shop Status
    isShopActive: false,

    // Profile
    profile: null,
    loadingProfile: false,

    // Riders
    riders: [],
    loadingRiders: false,

    // Prep List
    prepList: { summary: [], active: [], paused: [] },
    loadingPrepList: false,

    // Reviews
    reviewData: null,
    loadingReviews: false,

    // Revenue
    revenueData: null,
    loadingStats: false,
    payouts: [],
    loadingPayouts: false,
    payoutPagination: null,
    bankAccounts: [],
    loadingBanks: false,

    fetchDashboardStats: async (force = false) => {
        if (get().stats && !force) return;

        set({ loading: true });
        try {
            const res = await retailerService.getDashboardStats();
            if (res.success) {
                set({
                    stats: res.data,
                    isShopActive: res.data.stats?.isShopActive ?? get().isShopActive,
                    loading: false
                });
            }
        } catch (err) {
            console.error("Fetch dashboard stats failed", err);
            set({ loading: false });
        }
    },

    fetchRevenueStats: async (range, startDate, endDate, force = false) => {
        // Skip if data is already loaded for THIS request unless forcing
        if (get().revenueData && !force) return;

        set({ loadingStats: true });
        try {
            const res = await retailerService.getRevenueStats(range, startDate, endDate);
            if (res.success) {
                set({ revenueData: res.data, loadingStats: false });
            }
        } catch (err) {
            console.error("Fetch revenue stats failed", err);
            set({ loadingStats: false });
        }
    },

    fetchPayoutHistory: async (page = 1, limit = 10, force = false) => {
        if (get().payouts.length > 0 && get().payoutPagination?.page === page && !force) return;

        set({ loadingPayouts: true });
        try {
            const res = await retailerService.getPayoutHistory(page, limit);
            if (res.success) {
                set({ 
                    payouts: res.data || [], 
                    payoutPagination: res.pagination,
                    loadingPayouts: false 
                });
            } else {
                set({ payouts: [], loadingPayouts: false });
            }
        } catch (error) {
            console.error("Error fetching payouts:", error);
            set({ payouts: [], loadingPayouts: false });
        }
    },

    requestPayout: async (payoutData) => {
        try {
            const res = await retailerService.requestPayout(payoutData);
            // Refresh stats and history after successful request
            await get().fetchPayoutHistory(true);
            await get().fetchRevenueStats(undefined, undefined, undefined, true);
            return res;
        } catch (err) {
            throw err;
        }
    },

    fetchProfile: async (userId, force = false) => {
        if (!userId) return;

        if (get().profile && get().profile._id === userId && !force) return;

        set({ loadingProfile: true });
        try {
            const res = await retailerService.getProfile(userId);
            if (res.success) {
                set({ profile: res.data, isShopActive: res.data.isShopActive, loadingProfile: false });
            }
        } catch (err) {
            console.error("Fetch profile failed", err);
            set({ loadingProfile: false });
        }
    },

    updateProfile: async (profileData) => {
        try {
            const res = await retailerService.updateProfile(profileData);
            if (res.success) {
                set({ profile: res.data });
                return res;
            }
        } catch (err) {
            throw err;
        }
    },

    toggleShopStatus: async () => {
        try {
            const res = await retailerService.toggleShopStatus();
            if (res.success) {
                set(state => ({ isShopActive: !state.isShopActive }));
                return res;
            }
        } catch (err) {
            console.error("Toggle shop status failed", err);
            throw err;
        }
    },

    fetchRiders: async (force = false) => {
        if (get().riders.length > 0 && !force) return;

        set({ loadingRiders: true });
        try {
            const res = await retailerService.getRiders();
            if (res.success) {
                set({ riders: res.data, loadingRiders: false });
            }
        } catch (err) {
            console.error("Fetch riders failed", err);
            set({ loadingRiders: false });
        }
    },

    addRider: async (riderData) => {
        try {
            const res = await retailerService.addRider(riderData);
            if (res.success) {
                await get().fetchRiders(true);
                return res;
            }
        } catch (err) {
            throw err;
        }
    },

    updateRider: async (riderId, riderData) => {
        try {
            const res = await retailerService.updateRider(riderId, riderData);
            if (res.success) {
                set(state => ({
                    riders: state.riders.map(r => r._id === riderId ? res.data : r)
                }));
                return res;
            }
        } catch (err) {
            throw err;
        }
    },

    deleteRider: async (riderId) => {
        try {
            const res = await retailerService.deleteRider(riderId);
            if (res.success) {
                set(state => ({
                    riders: state.riders.filter(r => r._id !== riderId)
                }));
                return res;
            }
        } catch (err) {
            throw err;
        }
    },

    toggleRiderStatus: async (riderId, newStatus) => {
        try {
            const res = await retailerService.updateRiderStatus(riderId, newStatus);
            if (res.success) {
                set(state => ({
                    riders: state.riders.map(r => r._id === riderId ? { ...r, status: newStatus } : r)
                }));
                return res;
            }
        } catch (err) {
            throw err;
        }
    },

    fetchPrepList: async (date, force = false) => {

        if (get().prepList.length > 0 && !force) return;

        set({ loadingPrepList: true });
        try {
            const res = await retailerService.getPrepList(date);
            if (res.success) {
                set({ prepList: res.data || { summary: [], active: [], paused: [] }, loadingPrepList: false });
            }
        } catch (err) {
            console.error("Fetch prep list failed", err);
            set({ loadingPrepList: false });
        }
    },

    togglePrepItemStatus: (itemId) => {
        set(state => ({
            prepList: state.prepList.map(item => {
                if (item.id === itemId) {
                    const statuses = ['Pending', 'Ready', 'Shortage'];
                    const nextStatus = statuses[(statuses.indexOf(item.status) + 1) % 3];
                    return { ...item, status: nextStatus };
                }
                return item;
            })
        }));
    },

    fetchReviews: async (force = false) => {
        if (get().reviewData && !force) return;

        set({ loadingReviews: true });
        try {
            const res = await retailerService.getReviews();
            if (res.success) {
                set({ reviewData: res.data, loadingReviews: false });
            }
        } catch (err) {
            console.error("Fetch reviews failed", err);
            set({ loadingReviews: false });
        }
    },

    // Bank Actions
    fetchBanks: async (force = false) => {
        if (get().bankAccounts.length > 0 && !force) return;
        set({ loadingBanks: true });
        try {
            const res = await retailerService.getBanks();
            if (res.success) {
                set({ bankAccounts: res.data || [], loadingBanks: false });
            }
        } catch (err) {
            console.error("Fetch banks failed", err);
            set({ loadingBanks: false });
        }
    },

    addBank: async (bankData) => {
        try {
            const res = await retailerService.addBank(bankData);
            if (res.success) {
                await get().fetchBanks(true);
                return res;
            }
        } catch (err) {
            throw err;
        }
    },

    deleteBank: async (id) => {
        try {
            const res = await retailerService.deleteBank(id);
            if (res.success) {
                set(state => ({
                    bankAccounts: state.bankAccounts.filter(b => b._id !== id)
                }));
                return res;
            }
        } catch (err) {
            throw err;
        }
    },

    setDefaultBank: async (id) => {
        try {
            const res = await retailerService.setDefaultBank(id);
            if (res.success) {
                set(state => ({
                    bankAccounts: state.bankAccounts.map(b => ({
                        ...b,
                        isDefault: b._id === id
                    }))
                }));
                return res;
            }
        } catch (err) {
            throw err;
        }
    },
}));

export default useRetailerStore;
