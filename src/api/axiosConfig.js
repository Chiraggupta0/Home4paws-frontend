import axios from "axios";
import { supabase } from "../lib/supabaseClient";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

// Always use the fresh Supabase session token (auto-refreshed after 1 hour)
api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
});

export default api;
