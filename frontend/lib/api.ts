// lib/api.ts

import { API_BASE_URL } from './config';

// A helper function for fetching data
async function fetcher(url: string, options?: RequestInit) {
    const res = await fetch(`${API_BASE_URL}${url}`, options);
    if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.');
        try {
            // Try to parse the error message from the backend
            const errorData = await res.json();
            error.message = errorData.message || 'An error occurred.';
        } catch (e) {
            // Fallback if the error response isn't JSON
            error.message = `HTTP error! status: ${res.status}`;
        }
        throw error;
    }
    if (res.status === 204) {
        return null;
    }
    return res.json();
}

// --- API Functions ---

export const getDashboardData = (userId: string) => {
    return fetcher(`/dashboard/${userId}`);
};

export const getCollection = (collectionId: string) => {
    return fetcher(`/collections/${collectionId}`);
};

// This is the corrected function
export const createCollection = (data: { 
    name: string; 
    products: any[]; 
    userId: string; 
    description?: string; 
    coverImageUrl?: string | null; 
}) => {
    return fetcher('/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
};
export const updateCollection = (data: { id: string; name: string; products: any[] }) => {
    return fetcher(`/collections/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
};

export const deleteCollection = (collectionId: string) => {
    return fetcher(`/collections/${collectionId}`, {
        method: 'DELETE',
    });
};

export const searchProducts = (query: string, brandId: string | null, campaignId: string | null) => {
    const params = new URLSearchParams({ q: query });
    if (brandId) {
        params.append('brandId', brandId);
    }
    if (campaignId) { // <-- Add campaignId to params if it exists
        params.append('campaignId', campaignId);
    }
    return fetcher(`/products/search?${params.toString()}`);
};

export const getBrands = async () => {
    return fetcher('/brands');
};

// Add this new function to the end of lib/api.ts

export const universalSearch = (query: string) => {
    // We use encodeURIComponent to safely handle special characters in the search query
    return fetcher(`/search?q=${encodeURIComponent(query)}`);
};

export const getCreatorProfile = (username: string) => {
    return fetcher(`/public/creators/${username}`);
};

export const getProductDetails = (productId: string) => {
    return fetcher(`/products/${productId}`);
};

export const getCampaigns = () => {
    return fetcher('/public/campaigns');
};

