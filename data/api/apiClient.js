import axios from "axios";
// const baseURL = process.env.NEXT_PUBLIC_API_URL || "https://api.difwa.com/api";
// const baseURL = "http://localhost:5000/api";
const baseURL = "https://nontragic-rodney-allogenically.ngrok-free.dev/api";
// const baseURL = "https://difwa-backend.vercel.app/api";
// const baseURL = "https://localhost:3000";
// sdfsd
const apiClient = axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
        ...(baseURL.includes("ngrok") && { "ngrok-skip-browser-warning": "true" }),
    },
});

apiClient.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        // Log formatted request
        console.log(
            `🚀 %c[API Request] %c${config.method?.toUpperCase()} %c${config.url}`,
            "color: #FF6B00; font-weight: bold;",
            "color: #1B2D1F; font-weight: bold;",
            "color: #868E96;",
            config.data || ""
        );

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors globally
apiClient.interceptors.response.use(
    (response) => {
        // Log formatted response
        console.log(
            `✅ %c[API Response]  %c${response.status} %c${response.config.url}`,
            "color: #0096FF; font-weight: bold;",
            "color: #1B2D1F; font-weight: bold;",
            "color: #868E96;",
            response.data
        );
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized - maybe clear store/localStorage
            if (typeof window !== "undefined") {
                localStorage.removeItem("token");
                localStorage.removeItem("userId");
                // window.location.href = "/login";
            }
        }

        // Log formatted error
        console.log(
            `❌ %c[API Error] %c${error.response?.status || "Network Error"} %c${error.config?.url}`,
            "color: #FA5252; font-weight: bold;",
            "color: #1B2D1F; font-weight: bold;",
            "color: #868E96;",
            error.response?.data || error.message
        );

        return Promise.reject(error);
    }
);

export default apiClient;
