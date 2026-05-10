import { QueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

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

export const queryPersister = createSyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : undefined,
  key: "digitalhub-query-cache-v1",
  throttleTime: 1000,
});
