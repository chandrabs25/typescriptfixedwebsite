// src/types/next-auth.d.ts
// This file is kept for compatibility but is no longer needed with our custom auth solution

// Define empty types to prevent build errors
declare module "next-auth" {
  interface Session {
    user?: {
      id?: string;
      name?: string;
      email?: string;
      role?: string;
    };
  }

  interface User {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  }
}
