// src/hooks/useAuth.tsx
"use client"; // <-- MUST be at the top

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router

// TODO: Define or import your specific API fetch function/client
// import apiClient from '@/lib/apiClient';

// Define the User interface based on your API/DB schema
interface User {
  id: string | number;
  email: string;
  first_name?: string;
  last_name?: string;
  role_id?: number; // Match your DB schema
  // Add other fields as needed
}

// Define API response structures (adjust based on your actual API)
interface ApiResponseBase {
    success: boolean;
    message?: string;
}
interface MeApiResponse extends ApiResponseBase {
    data: User | null; // User data or null
}
interface LoginApiResponse extends ApiResponseBase {
    data: User | null; // User data or null
}
interface RegisterApiResponse extends ApiResponseBase {
   // Add data structure if your register API returns user ID or other info
   data?: { id: number | string };
}


// Define the shape of the context value
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // Update function signatures to match implementation
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkAuthState: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start true for initial check
  const router = useRouter();

  // Function to check auth status (e.g., on page load/refresh)
  const checkAuthState = useCallback(async () => {
    // Don't set loading true here if called manually later, only on initial load
    try {
      console.log("Checking auth state via /api/auth/me...");
      // Fetch user profile from API based session cookie
      const response = await fetch('/api/auth/me', { // Your actual endpoint
         method: 'GET',
         headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
         credentials: 'include', // Important to send cookies
      });

      const data: MeApiResponse = await response.json();

      if (response.ok && data.success && data.data) {
        console.log("Auth check successful, user found:", data.data);
        setUser(data.data); // Ensure structure matches User interface
      } else {
        console.log("Auth check failed or no user session found.");
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking auth state:", error);
      setUser(null); // Ensure user is null on error
    } finally {
      setIsLoading(false); // Stop loading once check is complete
    }
  }, []); // Dependencies: empty means it runs once on mount and refs don't change

  // Run the check on initial mount
  useEffect(() => {
    setIsLoading(true); // Set loading true for the *initial* check
    checkAuthState();
  }, [checkAuthState]); // Depend on the memoized checkAuthState


  // Login function
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log("Attempting login with:", email);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Important for setting cookies
      });

      const data: LoginApiResponse = await response.json();

      if (response.ok && data.success && data.data) {
         console.log("Login successful:", data.data);
         setUser(data.data);
         setIsLoading(false);
         return true; // Indicate success
      } else {
         console.error("Login API failed:", data.message);
         setUser(null); // Clear user on failed login
         setIsLoading(false);
         // Optionally, you could throw new Error(data.message || 'Login failed');
         return false; // Indicate failure
      }
    } catch (error) {
       console.error("Login fetch error:", error);
       setUser(null);
       setIsLoading(false);
       return false; // Indicate failure
    }
  }, []); // Dependencies

  // Register function
  const register = useCallback(async (name: string, email: string, password: string): Promise<{ success: boolean; message?: string }> => {
     setIsLoading(true);
     try {
        console.log("Attempting registration for:", email);
        // Your API expects `name`, not first/last separately for register endpoint
        const response = await fetch('/api/auth/register', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ name, email, password }), // Send name, email, password
        });

        const data: RegisterApiResponse = await response.json();

        if (response.ok && data.success) {
           console.log("Registration successful", data.message);
           setIsLoading(false);
           return { success: true, message: data.message || "Registration successful!" };
        } else {
           console.error("Registration API failed:", data.message);
           setIsLoading(false);
           return { success: false, message: data.message || "Registration failed." };
        }
     } catch (error) {
        console.error("Registration fetch error:", error);
        setIsLoading(false);
        return { success: false, message: "An unexpected error occurred." };
     }
  }, []); // Dependencies

  // Logout function
  const logout = useCallback(async () => {
     // No need to set loading for logout usually, but depends on UX preference
     // setIsLoading(true);
     try {
        console.log("Logging out...");
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include' // Send cookies to invalidate session server-side
        });
        // We don't necessarily need to wait for the API response or check its status.
        // The main goal is client-side cleanup.
     } catch (error) {
        console.error("Logout API call failed:", error);
        // Still proceed with client-side cleanup even if API fails
     } finally {
        setUser(null); // Clear user state immediately
        // Clear any local storage token if you were using one (though cookies are preferred)
        // localStorage.removeItem('authToken');
        // setIsLoading(false);
        console.log("Redirecting to signin page after logout.");
        router.push('/auth/signin'); // Redirect to login page
     }
  }, [router]); // Add router dependency

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user, // Boolean conversion
    isLoading,
    login,
    register, // Add register here
    logout,
    checkAuthState, // Provide the check function
  };

  // Provide the context value to children components
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}; // End of AuthProvider


// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // This error means useAuth was called outside of an AuthProvider
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};