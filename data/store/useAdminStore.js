import { create } from 'zustand';
import adminService from '../services/adminService';

const useAdminStore = create((set, get) => ({
    // Dashboard
    stats: null,
    loadingStats: false,

    // Users
    usersData: null,
    loadingUsers: false,
    usersSearchQuery: "",
    lastFetchedUsersParams: null,

    // Retailers / Partners
    retailersData: null,
    loadingRetailers: false,
    retailersSearchQuery: "",
    activeRetailerTab: "under_review",
    lastFetchedTab: "",

    // Payouts
    payouts: [],
    loadingPayouts: false,
    payoutSearchQuery: "",

    // Roles
    roles: [],
    loadingRoles: false,

    // Categories
    categoriesData: null,
    loadingCategories: false,
    lastFetchedCategoriesParams: null,

    // Admin Users (Staff)
    adminsData: [],
    loadingAdmins: false,

    // Orders
    ordersData: null,
    loadingOrders: false,
    lastFetchedParams: null,

    // Commission
    commissionData: null,
    loadingCommission: false,

    // Audience (Communication)
    audienceCount: 0,
    loadingAudience: false,

    setUsersSearchQuery: (query) => set({ usersSearchQuery: query }),
    setRetailersSearchQuery: (query) => set({ retailersSearchQuery: query }),
    setActiveRetailerTab: (tab) => set({ activeRetailerTab: tab }),
    setPayoutSearchQuery: (query) => set({ payoutSearchQuery: query }),

    fetchDashboardStats: async (force = false) => {
        if (get().stats && !force) return;
        set({ loadingStats: true });
        try {
            const res = await adminService.getDashboardStats();
            set({ 
                stats: res.success ? res.data : null, 
                loadingStats: false 
            });
        } catch (err) {
            console.error("Fetch admin stats failed", err);
            set({ loadingStats: false });
        }
    },

    fetchUsers: async (page = 1, limit = 10, search = "", force = false) => {
        const paramsKey = JSON.stringify({ page, limit, search });
        if (get().usersData && get().lastFetchedUsersParams === paramsKey && !force) return;

        set({ loadingUsers: true, usersSearchQuery: search });
        try {
            const res = await adminService.getUsers(page, limit, search);
            set({ 
                usersData: res.success ? res : get().usersData, 
                loadingUsers: false, 
                lastFetchedUsersParams: res.success ? paramsKey : get().lastFetchedUsersParams 
            });
        } catch (err) {
            console.error("Fetch admin users failed", err);
            set({ loadingUsers: false });
        }
    },

    fetchRetailers: async (status, page = 1, limit = 10, search = "", force = false) => {
        const currentTab = status || get().activeRetailerTab;
        if (get().retailersData && get().lastFetchedTab === currentTab && get().retailersSearchQuery === search && !force) return;

        set({ loadingRetailers: true, activeRetailerTab: currentTab, retailersSearchQuery: search });
        try {
            const res = await adminService.getRetailers(currentTab, page, limit, search);
            set({ 
                retailersData: res.success ? res : get().retailersData, 
                loadingRetailers: false, 
                lastFetchedTab: res.success ? currentTab : get().lastFetchedTab 
            });
        } catch (err) {
            console.error("Fetch admin retailers failed", err);
            set({ loadingRetailers: false });
        }
    },

    fetchPayouts: async (search = "", force = false) => {
        if (get().payouts.length > 0 && get().payoutSearchQuery === search && !force) return;
        set({ loadingPayouts: true, payoutSearchQuery: search });
        try {
            const res = await adminService.getPayouts(search);
            set({ 
                payouts: res.success ? res.data : [], 
                loadingPayouts: false 
            });
        } catch (err) {
            console.error("Fetch admin payouts failed", err);
            set({ loadingPayouts: false });
        }
    },

    fetchRoles: async (force = false) => {
        if (get().roles.length > 0 && !force) return;
        set({ loadingRoles: true });
        try {
            const res = await adminService.getRoles();
            set({ 
                roles: res.success ? res.data : [], 
                loadingRoles: false 
            });
        } catch (err) {
            console.error("Fetch admin roles failed", err);
            set({ loadingRoles: false });
        }
    },

    fetchCategories: async (page = 1, limit = 10, search = "", force = false) => {
        const paramsKey = JSON.stringify({ page, limit, search });
        if (get().categoriesData && get().lastFetchedCategoriesParams === paramsKey && !force) return;
        
        set({ loadingCategories: true });
        try {
            const res = await adminService.getCategories(page, limit, search);
            set({ 
                categoriesData: res.success ? res : get().categoriesData, 
                loadingCategories: false, 
                lastFetchedCategoriesParams: res.success ? paramsKey : get().lastFetchedCategoriesParams 
            });
        } catch (err) {
            console.error("Fetch admin categories failed", err);
            set({ loadingCategories: false });
        }
    },

    fetchAdmins: async (force = false) => {
        if (get().adminsData.length > 0 && !force) return;
        set({ loadingAdmins: true });
        try {
            const res = await adminService.getAdmins();
            set({ 
                adminsData: res.success ? res.data : [], 
                loadingAdmins: false 
            });
        } catch (err) {
            console.error("Fetch admin staff failed", err);
            set({ loadingAdmins: false });
        }
    },

    fetchOrders: async (params = {}, force = false) => {
        const paramsKey = JSON.stringify(params);
        if (get().ordersData && get().lastFetchedParams === paramsKey && !force) return;

        set({ loadingOrders: true });
        try {
            const res = await adminService.getOrders(params);
            set({ 
                ordersData: res.success ? { ...res.data, pagination: res.pagination } : get().ordersData, 
                loadingOrders: false,
                lastFetchedParams: res.success ? paramsKey : get().lastFetchedParams
            });
        } catch (err) {
            console.error("Fetch admin orders failed", err);
            set({ loadingOrders: false });
        }
    },

    fetchCommissionData: async (force = false) => {
        if (get().commissionData && !force) return;
        set({ loadingCommission: true });
        try {
            const res = await adminService.getCommissionSetting();
            set({ 
                commissionData: res.success ? res.data : null, 
                loadingCommission: false 
            });
        } catch (err) {
            console.error("Fetch commission setting failed", err);
            set({ loadingCommission: false });
        }
    },

    fetchAudienceCount: async (force = false) => {
        if (get().audienceCount > 0 && !force) return;
        set({ loadingAudience: true });
        try {
            const res = await adminService.getRetailers("approved", 1, 1);
            set({ 
                audienceCount: res.success ? res.pagination.totalRetailers : 0, 
                loadingAudience: false 
            });
        } catch (err) {
            console.error("Fetch audience count failed", err);
            set({ loadingAudience: false });
        }
    }
}));

export default useAdminStore;
