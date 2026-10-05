import axios from "axios";
import { supabase } from "../lib/supabaseClient";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 60000
});

// Always use the fresh Supabase session token
api.interceptors.request.use(async (config) => {

    const {
        data: { session }
    } = await supabase.auth.getSession();

    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }

    return config;
});

// Handle Render cold starts
api.interceptors.response.use(
    (response) => response,

    async (error) => {

        const config = error.config;

        // Don't retry the same request more than once
        if (!config || config._retry) {
            return Promise.reject(error);
        }

        const isColdStartError =
            error.code === "ECONNABORTED" ||
            error.code === "ERR_NETWORK" ||
            error.response?.status >= 500;

        if (!isColdStartError) {
            return Promise.reject(error);
        }

        config._retry = true;

        try {

            // Wake Render backend
            await fetch(
                `${import.meta.env.VITE_API_URL}/health`
            );

        } catch (e) {

            console.log("Backend is waking up...");

        }

        // Give Render some time to start
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Retry original API request
        return api(config);
    }
);

export default api;