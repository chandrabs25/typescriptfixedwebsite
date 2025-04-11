// src/app/providers.tsx
"use client"; // <-- Mark this component as a Client Component

import React, { ReactNode } from 'react'; // Import React
import { AuthProvider } from '@/hooks/useAuth'; // Import the AuthProvider
import Header from '@/components/Header'; // Adjust path if needed
import Footer from '@/components/Footer'; // Adjust path if needed
import { Toaster } from "@/components/ui/sonner"; // Import Sonner Toaster for notifications

// This component wraps children with client-side providers
export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {/* Basic structure: Header, Main Content, Footer */}
      <div className="flex flex-col min-h-screen">
        <Header /> {/* Header can now use useAuth */}
        <main className="flex-grow">
          {children} {/* Page content */}
        </main>
        <Footer /> {/* Footer can also use useAuth if needed */}
        <Toaster position="top-right" richColors /> {/* Add Toaster for notifications */}
      </div>
    </AuthProvider>
  );
}