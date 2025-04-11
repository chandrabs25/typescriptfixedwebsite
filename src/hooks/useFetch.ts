// src/hooks/useFetch.ts
'use client';

import { useState, useEffect, useCallback } from 'react'; // Make sure useCallback is imported if needed, though not used directly here currently

// Define loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Define a generic interface for API responses
interface ApiResponse<T> {
  success: boolean;
  data?: T; // Data is optional and generic
  message?: string; // Optional error/status message
}

// Generic hook for data fetching with loading states
// The hook itself is generic over the expected data type T
export function useFetch<T>(url: string | null, options?: RequestInit) { // Allow URL to be null to prevent fetching initially
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<LoadingState>('idle');

  // Memoize options using JSON.stringify to handle object changes
  const memoizedOptions = JSON.stringify(options);

  useEffect(() => {
    // Function to perform the fetch
    const fetchData = async () => {
      // Don't fetch if URL is null or empty
      if (!url) {
        setStatus('idle');
        setData(null); // Ensure data is cleared if URL becomes null
        setError(null);
        return;
      }

      // Reset state for new fetch
      setStatus('loading');
      setData(null);
      setError(null);

      try {
        const currentOptions = JSON.parse(memoizedOptions || '{}'); // Parse memoized options
        const response = await fetch(url, {
          ...currentOptions,
          credentials: 'include', // Include cookies for auth
        });

        // Try parsing the body regardless of status first to get potential error messages
        let result: ApiResponse<T>;
        try {
            result = await response.json() as ApiResponse<T>;
        } catch (jsonError) {
            // Handle cases where response is not JSON
            throw new Error(`Request failed with status ${response.status} and non-JSON response.`);
        }

        if (!response.ok) {
           // Use message from parsed body if available, otherwise use status text
           const errorMessage = result?.message || response.statusText || `HTTP error! Status: ${response.status}`;
           throw new Error(errorMessage);
        }

        // Process successful response
        if (result.success) {
           if (result.data !== undefined) {
             setData(result.data);
             setStatus('success');
           } else {
             // Success reported, but no data (could be valid)
             setData(null);
             setStatus('success');
             console.warn(`Fetch successful but no data returned for URL: ${url}`);
           }
        } else {
          // API reported success: false
          throw new Error(result.message || 'API returned success: false');
        }
      } catch (err) {
        console.error(`Fetch error for URL ${url}:`, err);
        // Avoid setting state if the component unmounted during the fetch
        // (Requires adding an isMounted check or using AbortController)
        setError(err instanceof Error ? err : new Error('Unknown fetch error occurred'));
        setStatus('error');
      }
    };

    fetchData();

    // AbortController setup could be added here for cleanup

  }, [url, memoizedOptions]); // Depend on URL and memoized options

  return { data, error, status, isLoading: status === 'loading' };
}


// Hook for submitting data with loading states
// T = Type of data being submitted (formData)
// R = Type of data expected in the response
export function useSubmit<T, R>(url: string) {
  const [data, setData] = useState<R | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<LoadingState>('idle');

  const submit = async (formData: T, method: 'POST' | 'PUT' | 'DELETE' = 'POST') => {
    setStatus('loading');
    setData(null); // Reset previous data/error on new submission
    setError(null);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json', // Good practice to include Accept header
        },
        body: JSON.stringify(formData),
        credentials: 'include', // Include cookies for auth
      });

      // Declare result with the expected successful structure
      let result: ApiResponse<R>;

      try {
        // Attempt to parse JSON
        result = await response.json() as ApiResponse<R>; // Assert the expected type
      } catch (jsonError) {
        // If parsing fails, throw an error immediately.
        console.error("Failed to parse JSON response:", jsonError);
        throw new Error(`Request failed with status ${response.status} and non-JSON response.`);
      }

      // Check response.ok and result properties
      if (response.ok && result.success) {
        // Handle success cases
        if (result.data !== undefined) {
            setData(result.data); // Set the data of type R
            setStatus('success');
            return { success: true, data: result.data };
        } else {
            // Handle success with no data returned
            setData(null);
            setStatus('success');
            console.warn(`Submit successful but no data returned for URL: ${url}`);
            return { success: true, data: null };
        }
      } else {
        // Handle API error (response.ok might be true but result.success false, or response.ok false)
        throw new Error(result.message || `API Error: Status ${response.status}`);
      }
    } catch (err) {
      console.error('Submit error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown submit error occurred';
      setError(new Error(errorMessage));
      setStatus('error');
      return { success: false, error: errorMessage };
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setStatus('idle');
  };

  return { submit, data, error, status, isLoading: status === 'loading', reset };
}