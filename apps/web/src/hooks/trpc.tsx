import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import type { AppRouter } from "@repo/trpc";
import superjson from "superjson";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "./auth";
import React from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const trpc = createTRPCReact<AppRouter>();

function createTRPCClient(getToken: () => Promise<string | null>) {
  return trpc.createClient({
    links: [
      httpBatchLink({
        transformer: superjson,
        url: `http://localhost:3000/trpc`,
        headers: async () => {
          const token = await getToken();
          
          return {
            Authorization: token ? `Bearer ${token}` : "",
          };
        },
      }),
    ],
  });
}

const queryClient = new QueryClient();

export function TRPCProvider({ children }: { children?: React.JSX.Element }) {
  const { loaded, getToken } = useAuth();

const trpcClient = React.useMemo(()=>createTRPCClient(getToken), [getToken])
  
  return (
    loaded&&<trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}