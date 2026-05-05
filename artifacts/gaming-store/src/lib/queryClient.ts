import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000, // 30 minutes - product data is relatively static
      gcTime: 60 * 60 * 1000, // 60 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
