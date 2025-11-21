"use client";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./theme/ThemeProvider";

// Create QueryClient with secure defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Security: Don't retry on authentication errors
      retry: (failureCount, error) => {
        // Don't retry on authentication/authorization errors
        if (error.message.includes('401') || error.message.includes('403')) {
          return false;
        }
        // Retry network errors up to 2 times
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Security: Shorter stale time for sensitive data
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection time)
      // Security: Disable refetch on window focus for sensitive data
      refetchOnWindowFocus: false,
      // Security: Disable automatic background refetch
      refetchOnMount: true,
      refetchOnReconnect: true,
      // Network mode for offline handling
      networkMode: 'online',
    },
    mutations: {
      // Don't retry mutations by default for security
      retry: false,
      // Network mode for offline handling
      networkMode: 'online',
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
