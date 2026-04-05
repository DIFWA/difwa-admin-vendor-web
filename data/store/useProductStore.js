import { create } from 'zustand';
import retailerService from '../services/retailerService';

const useProductStore = create((set, get) => ({
    products: [],
    categories: [],
    loading: false,
    error: null,
    selectedProduct: null,
    setSelectedProduct: (product) => set({ selectedProduct: product }),

    searchQuery: "",
    setSearchQuery: (query) => set({ searchQuery: query }),

    fetchProducts: async (force = false) => {

        if (get().products.length > 0 && !force) return;

        set({ loading: true, error: null });
        try {
            const res = await retailerService.getProducts();
            if (res.success) {
                set({ products: res.data, loading: false });
            }
        } catch (err) {
            console.error("Fetch products failed", err);
            set({ error: err.message, loading: false });
        }
    },

    fetchCategories: async () => {
        try {
            const res = await retailerService.getCategories();
            if (res.success) {
                set({ categories: res.data });
            }
        } catch (err) {
            console.error("Fetch categories failed", err);
        }
    },

    createProduct: async (productData) => {
        try {
            const res = await retailerService.createProduct(productData);
            if (res.success) {
                await get().fetchProducts();
                return res;
            }
        } catch (err) {
            throw err;
        }
    },

    updateProduct: async (id, productData) => {
        try {
            const res = await retailerService.updateProduct(id, productData);
            if (res.success) {
                await get().fetchProducts();
                if (get().selectedProduct?.id === id || get().selectedProduct?._id === id) {
                    set({ selectedProduct: res.data });
                }
                return res;
            }
        } catch (err) {
            throw err;
        }
    },

    deleteProduct: async (id) => {
        try {
            const res = await retailerService.deleteProduct(id);
            if (res.success) {
                set(state => ({
                    products: state.products.filter(p => (p.id !== id && p._id !== id))
                }));
                if (get().selectedProduct?.id === id || get().selectedProduct?._id === id) {
                    set({ selectedProduct: null });
                }
                return res;
            }
        } catch (err) {
            throw err;
        }
    }
}));

export default useProductStore;
