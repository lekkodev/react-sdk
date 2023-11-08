'use client';
import { useQueryClient, defaultShouldDehydrateQuery, dehydrate, hydrate } from '@tanstack/react-query';
import * as React from 'react';
import { createHydrationStreamProvider } from './HydrationStreamProvider.js';

const stream = createHydrationStreamProvider();

/**
 * This component is responsible for:
 * - hydrating the query client on the server
 * - dehydrating the query client on the server
 */
function ReactQueryStreamedHydration(props) {
  const queryClient = useQueryClient(props.queryClient);

  /**
   * We need to track which queries were added/updated during the render
   */
  const [trackedKeys] = React.useState(() => new Set());

  // <server only>
  if (typeof window === 'undefined') {
    // Do we need to care about unsubscribing? I don't think so to be honest
    queryClient.getQueryCache().subscribe(event => {
      switch (event.type) {
        case 'added':
        case 'updated':
          // console.log('tracking', event.query.queryHash, 'b/c of a', event.type)
          trackedKeys.add(event.query.queryHash);
      }
    });
  }
  // </server only>

  return /*#__PURE__*/React.createElement(stream.Provider, {
    // Happens on server:
    onFlush: () => {
      /**
       * Dehydrated state of the client where we only include the queries that were added/updated since the last flush
       */
      const shouldDehydrate = props.options?.dehydrate?.shouldDehydrateQuery ?? defaultShouldDehydrateQuery;
      const dehydratedState = dehydrate(queryClient, {
        ...props.options?.dehydrate,
        shouldDehydrateQuery(query) {
          return trackedKeys.has(query.queryHash) && shouldDehydrate(query);
        }
      });
      trackedKeys.clear();
      if (!dehydratedState.queries.length) {
        return [];
      }
      return [dehydratedState];
    }
    // Happens in browser:
    ,
    onEntries: entries => {
      for (const hydratedState of entries) {
        hydrate(queryClient, hydratedState, props.options?.hydrate);
      }
    }
    // Handle BigInts etc using superjson
    ,
    transformer: props.transformer
  }, props.children);
}

export { ReactQueryStreamedHydration };
//# sourceMappingURL=ReactQueryStreamedHydration.js.map