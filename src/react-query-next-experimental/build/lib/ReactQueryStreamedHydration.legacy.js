'use client';
import { useQueryClient, defaultShouldDehydrateQuery, dehydrate, hydrate } from '@tanstack/react-query';
import * as React from 'react';
import { createHydrationStreamProvider } from './HydrationStreamProvider.legacy.js';

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
      var _props$options$dehydr, _props$options, _props$options$dehydr2, _props$options2;
      /**
       * Dehydrated state of the client where we only include the queries that were added/updated since the last flush
       */
      const shouldDehydrate = (_props$options$dehydr = (_props$options = props.options) == null ? void 0 : (_props$options$dehydr2 = _props$options.dehydrate) == null ? void 0 : _props$options$dehydr2.shouldDehydrateQuery) != null ? _props$options$dehydr : defaultShouldDehydrateQuery;
      const dehydratedState = dehydrate(queryClient, {
        ...((_props$options2 = props.options) == null ? void 0 : _props$options2.dehydrate),
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
        var _props$options3;
        hydrate(queryClient, hydratedState, (_props$options3 = props.options) == null ? void 0 : _props$options3.hydrate);
      }
    }
    // Handle BigInts etc using superjson
    ,
    transformer: props.transformer
  }, props.children);
}

export { ReactQueryStreamedHydration };
//# sourceMappingURL=ReactQueryStreamedHydration.legacy.js.map
