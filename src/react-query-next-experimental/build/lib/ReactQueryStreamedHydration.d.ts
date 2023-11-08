import type { DehydratedState, DehydrateOptions, HydrateOptions, QueryClient } from '@tanstack/react-query';
import * as React from 'react';
import type { HydrationStreamProviderProps } from './HydrationStreamProvider';
/**
 * This component is responsible for:
 * - hydrating the query client on the server
 * - dehydrating the query client on the server
 */
export declare function ReactQueryStreamedHydration(props: {
    children: React.ReactNode;
    queryClient?: QueryClient;
    options?: {
        hydrate?: HydrateOptions;
        dehydrate?: DehydrateOptions;
    };
    transformer?: HydrationStreamProviderProps<DehydratedState>['transformer'];
}): React.JSX.Element;
//# sourceMappingURL=ReactQueryStreamedHydration.d.ts.map