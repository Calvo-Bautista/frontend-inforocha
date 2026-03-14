import useSWR from 'swr';
import { usersAPI, productsAPI, clientsAPI, ordersAPI } from '@/lib/api';

const SWR_COMMON_CONFIG = {
    keepPreviousData: true,   // UX: Show stale data while fetching new page
    revalidateOnFocus: false, // Avoid re-fetching when user refocuses the tab
    dedupingInterval: 5000,   // Dedupe identical requests within 5 seconds
};

// --- Users ---
export function useUsers(params = {}) {
    const key = ['users', JSON.stringify(params)];
    const { data, error, isLoading, mutate } = useSWR(
        key,
        () => usersAPI.getAll(params),
        SWR_COMMON_CONFIG
    );
    return {
        users: Array.isArray(data) ? data : [],
        total: data?.total || 0,
        isLoading,
        isError: error,
        mutate,
    };
}

// --- Products ---
export function useProducts(params = {}) {
    const key = ['products', JSON.stringify(params)];
    const { data, error, isLoading, mutate } = useSWR(
        key,
        () => productsAPI.getAll(params),
        SWR_COMMON_CONFIG
    );
    return {
        products: Array.isArray(data) ? data : [],
        total: data?.total || 0,
        isLoading,
        isError: error,
        mutate,
    };
}

// --- Clients ---
export function useClients(params = {}) {
    const key = ['clients', JSON.stringify(params)];
    const { data, error, isLoading, mutate } = useSWR(
        key,
        () => clientsAPI.getAll(params),
        SWR_COMMON_CONFIG
    );
    return {
        clients: Array.isArray(data) ? data : [],
        total: data?.total || 0,
        isLoading,
        isError: error,
        mutate,
    };
}

// --- Orders ---
export function useOrders(params = {}) {
    const key = ['orders', JSON.stringify(params)];
    const { data, error, isLoading, mutate } = useSWR(
        key,
        () => ordersAPI.getAll(params),
        SWR_COMMON_CONFIG
    );
    return {
        orders: Array.isArray(data) ? data : [],
        total: data?.total || 0,
        isLoading,
        isError: error,
        mutate,
    };
}

// --- Order Stats ---
export function useOrderStats(params = {}) {
    const key = ['order-stats', JSON.stringify(params)];
    const { data, error, isLoading } = useSWR(
        key,
        () => ordersAPI.getStats(params),
        {
            ...SWR_COMMON_CONFIG,
            dedupingInterval: 15000, // Stats are cheaper to cache longer
        }
    );
    return {
        stats: data || null,
        isLoading,
        isError: error,
    };
}

// --- User Stats ---
export function useUserStats() {
    const { data, error, isLoading } = useSWR(
        'user-stats',
        () => usersAPI.getStats(),
        {
            ...SWR_COMMON_CONFIG,
            dedupingInterval: 15000,
        }
    );
    return {
        stats: data || { vendedor: 0, logistica: 0, admin: 0, owner: 0 },
        isLoading: isLoading,
        isError: error,
    };
}

