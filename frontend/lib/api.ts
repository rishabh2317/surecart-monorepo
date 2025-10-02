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
export const getCampaignCategories = (campaignId: string) => {
    return fetcher(`/public/campaigns/${campaignId}/categories`);
};
export const getCategories = () => {
    return fetcher(`/public/categories`);
};
export const searchProducts = (query: string, brandId: string | null, campaignId: string | null, categoryId: string | null) => {
    const params = new URLSearchParams({ q: query });
    if (brandId) {
        params.append('brandId', brandId);
    }
    if (campaignId) { // <-- Add campaignId to params if it exists
        params.append('campaignId', campaignId);
    }
    if (categoryId) params.append('categoryId', categoryId);

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
export const followCreator = async ({ creatorId, userId }: { creatorId: string, userId: string }) => {
    return fetcher(`/users/${creatorId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
    });
};

export const unfollowCreator = async ({ creatorId, userId }: { creatorId: string, userId: string }) => {
    // Note: DELETE requests might not have a body, but we'll return a simple true on success
    await fetcher(`/users/${creatorId}/unfollow`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
    });
    return true;
};

export const getFollowStatus = (creatorId: string, userId: string) => {
    // This check prevents the API call if IDs are not ready
    if (!creatorId || !userId) return Promise.resolve({ isFollowing: false });
    return fetcher(`/users/${userId}/follow-status/${creatorId}`);
};
// ++ NEW FUNCTION ++
export const fetchUrlMetadata = (url: string) => {
    return fetcher('/api/fetch-url-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
    });
};

// Function to record a product click
export const recordClick = async (data: { productId: string; collectionId: string; userId?: string }) => {
    return fetcher(`/products/${data.productId}/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            collectionId: data.collectionId,
            userId: data.userId 
        }),
    });
};

// Function to record a collection view
export const recordCollectionView = async (data: { collectionId: string; userId?: string }) => {
    // We use a "fire and forget" approach here, so we don't need to wait for the response
    fetcher(`/collections/${data.collectionId}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data.userId }),
    });
};
export const likeCollection = async ({ collectionId, userId }: { collectionId: string, userId: string }) => {
    return fetcher(`/collections/${collectionId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
    });
};

export const unlikeCollection = async ({ collectionId, userId }: { collectionId: string, userId: string }) => {
    return fetcher(`/collections/${collectionId}/unlike`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
    });
};

// We also need to fetch the initial status for a batch of collections
export const getFeedInteractionStatus = async (collectionIds: string[], userId: string) => {
    if (!userId || collectionIds.length === 0) return {};
    return fetcher(`/users/${userId}/feed-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionIds }),
    });
};

export const getCreatorCollections = (username: string, cursor?: string) => {
    const url = cursor ? `/public/creators/${username}/collections?cursor=${cursor}` : `/public/creators/${username}/collections`;
    return fetcher(url);
};

export const getCreatorProducts = (username: string) => {
    return fetcher(`/public/creators/${username}/products`);
};

// ++ THIS IS THE NEW FUNCTION THAT WAS MISSING ++
export const getBulkFollowStatus = (creatorIds: string[], userId: string) => {
    // We add checks to prevent unnecessary API calls
    if (!userId || !Array.isArray(creatorIds) || creatorIds.length === 0) {
        return Promise.resolve({});
    }
    return fetcher(`/users/${userId}/bulk-follow-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorIds }),
    });
};

export const getHomepageFeed = (cursor?: string) => {
    const url = cursor ? `/public/home?cursor=${cursor}` : '/public/home';
    return fetcher(url);
};