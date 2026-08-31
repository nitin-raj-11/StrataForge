import axios from "axios";

let clerkTokenGetter: (() => Promise<string | null>) | null = null;

export function setClerkTokenGetter(getter: (() => Promise<string | null>) | null) {
  clerkTokenGetter = getter;
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use(async (config) => {
  if (clerkTokenGetter) {
    try {
      const token = await clerkTokenGetter();
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      // Let Clerk surface the authentication state; do not fall back to stale local tokens.
    }
  }
  return config;
});

export default client;
