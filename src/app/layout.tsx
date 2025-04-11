// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Example font, adjust if needed
import './globals.css'; // Your global styles
import { Providers } from './providers'; // Import the client-side providers wrapper
import React from 'react'; // Import React

// Setup font (optional, adjust as needed)
const inter = Inter({ subsets: ['latin'] });

// Define metadata (can also be in metadata.ts)
export const metadata: Metadata = {
  title: 'Reach Andaman Travel Platform',
  description: 'Discover the beauty of Andaman Islands with our comprehensive travel platform.',
  // Add more metadata as needed: icons, openGraph, etc.
};

// Define the RootLayout component (Server Component)
export default function RootLayout({
  children,
}: Readonly<{ // Use Readonly for props type
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Apply font class to body (optional) */}
      <body className={inter.className}>
        {/* Use the Providers component to wrap children */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}