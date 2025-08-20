// lib/config.ts
const getApiBaseUrl = (): string => {
    const url = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!url) {
      // In a development environment, we can fall back to localhost.
      if (process.env.NODE_ENV === 'development') {
        return 'http://localhost:3001';
      }
      // In a production environment, this is a critical error.
      throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined. The application cannot connect to the backend.");
    }
    return url;
  };
  
  export const API_BASE_URL = getApiBaseUrl();