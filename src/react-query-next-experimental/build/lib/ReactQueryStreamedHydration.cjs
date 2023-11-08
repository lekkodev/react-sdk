'use client';
'use strict';

var reactQuery = require('@tanstack/react-query');
var React = require('react');
var HydrationStreamProvider = require('./HydrationStreamProvider.cjs');

function _interopNamespaceDefault(e) {
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var React__namespace = /*#__PURE__*/_interopNamespaceDefault(React);

const stream = HydrationStreamProvider.createHydrationStreamProvider();

/**
 * This component is responsible for:
 * - hydrating the query client on the server
 * - dehydrating the query client on the server
 */
function ReactQueryStreamedHydration(props) {
  const queryClient = reactQuery.useQueryClient(props.queryClient);

  /**
   * We need to track which queries were added/updated during the render
   */
  const [trackedKeys] = React__namespace.useState(() => new Set());

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

  return /*#__PURE__*/React__namespace.createElement(stream.Provider, {
    // Happens on server:
    onFlush: () => {
      /**
       * Dehydrated state of the client where we only include the queries that were added/updated since the last flush
       */
      const shouldDehydrate = props.options?.dehydrate?.shouldDehydrateQuery ?? reactQuery.defaultShouldDehydrateQuery;
      const dehydratedState = reactQuery.dehydrate(queryClient, {
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
        reactQuery.hydrate(queryClient, hydratedState, props.options?.hydrate);
      }
    }
    // Handle BigInts etc using superjson
    ,
    transformer: props.transformer
  }, props.children);
}

exports.ReactQueryStreamedHydration = ReactQueryStreamedHydration;
//# sourceMappingURL=ReactQueryStreamedHydration.cjs.map
