export const API_ENDPOINTS = {
    RETAILER: {
        DASHBOARD_STATS: "/retailer/dashboard-stats",
        ORDERS: "/retailer/orders",
        ORDER_STATUS: "/retailer/order-status",
        REVIEWS: "/retailer/reviews",
        REVENUE_STATS: "/retailer/revenue-stats",
        CUSTOMERS: "/retailer/customers",
        CATEGORIES: "/retailer/categories",
        PRODUCTS: "/retailer/products",
        PROFILE: "/retailer/profile",
        TOGGLE_STATUS: "/retailer/toggle-status",
        PREP_LIST: "/retailer/prep-list",
        ASSIGN_RIDER: "/retailer/assign-rider",
        ORDERS_MANUAL: "/retailer/orders/manual",
        SUBSCRIPTIONS_MANUAL: "/retailer/subscriptions/manual",
        SUBSCRIPTIONS: "/retailer/subscriptions",
        SEARCH: "/retailer/search",
        BULK_PROCESS_ORDERS: "/retailer/orders/bulk-process",
        CUSTOMERS_SETTLE_DUE: "/retailer/customers/settle-due"
    },
    ADMIN: {
        DASHBOARD_STATS: "/admin/dashboard-stats",
        ORDERS: "/admin/orders",
        RETAILERS: "/admin/retailers",
        USERS: "/admin/users",
        CATEGORIES: "/admin/categories",
        ROLES: "/admin/roles",
        INVITE: "/admin/invite",
        CHANGE_PASSWORD: "/admin/change-password",
        ADMINS: "/admin/admins",
        RETAILERS_STATUS: "/admin/retailers/status"
    },
    PAYOUT: {
        REQUEST: "/payout/request",
        MY_HISTORY: "/payout/my-history",
        ALL: "/payout/all",
        APPROVE: "/payout/approve"
    },
    AUTH: {
        ME: "/auth/me"
    },
    COMMUNICATION: {
        NOTIFY_ALL: "/communication/notify-all",
        EMAIL_ALL: "/communication/email-all"
    },
    UPLOAD: {
        IMAGE: "/upload/image",
        FILE: "/upload"
    },
    RIDER: {
        RETAILER: "/rider/retailer",
        ADD: "/rider/add"
    },
    COMMISSION: {
        BASE: "/commission"
    }
};
