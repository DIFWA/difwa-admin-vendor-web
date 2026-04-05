import { create } from 'zustand';
import retailerService from '../services/retailerService';

const useCustomerStore = create((set, get) => ({
    customersData: null,
    loading: false,
    error: null,
    selectedCustomer: null,
    searchQuery: "",

    setSearchQuery: (query) => set({ searchQuery: query }),
    setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),

    fetchCustomers: async (force = false) => {
        // Skip if data is already loaded and not forcing a refresh
        if (get().customersData && !force) return;

        set({ loading: true, error: null });
        try {
            const res = await retailerService.getCustomers();
            if (res.success) {
                set({ customersData: res.data, loading: false });
            }
        } catch (err) {
            set({ error: err.message, loading: false });
        }
    },

    settleBalance: async (customerId, amount) => {
        try {
            const res = await retailerService.settleCustomerDue(customerId, amount);
            if (res.success) {
                await get().fetchCustomers();
                const updatedCustomer = get().customersData.customers.find(c => c.id === customerId);
                if (updatedCustomer) {
                    set({ selectedCustomer: updatedCustomer });
                }
                return res;
            }
        } catch (err) {
            throw err;
        }
    }
}));

export default useCustomerStore;
