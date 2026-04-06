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
                // Prepend optimistically — socket will deduplicate
                set(state => ({ products: [res.data, ...state.products] }));
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
                // Patch in-place immediately — no full refetch needed
                set(state => ({
                    products: state.products.map(p =>
                        (p._id === id || p.id === id) ? { ...p, ...res.data } : p
                    ),
                    selectedProduct:
                        (state.selectedProduct?._id === id || state.selectedProduct?.id === id)
                            ? { ...state.selectedProduct, ...res.data }
                            : state.selectedProduct
                }));
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
