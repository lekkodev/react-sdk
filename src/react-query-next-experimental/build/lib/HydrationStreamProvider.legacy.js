'use client';
import { useServerInsertedHTML } from 'next/navigation';
import * as React from 'react';

function createHydrationStreamProvider() {
  const context = /*#__PURE__*/React.createContext(null);
  /**
    * 1. (Happens on server): `useServerInsertedHTML()` is called **on the server** whenever a `Suspense`-boundary completes
   *    - This means that we might have some new entries in the cache that needs to be flushed
   *    - We pass these to the client by inserting a `<script>`-tag where we do `window[id].push(serializedVersionOfCache)`
   * 2. (Happens in browser) In `useEffect()`:
   *   - We check if `window[id]` is set to an array and call `push()` on all the entries which will call `onEntries()` with the new entries
   *   - We replace `window[id]` with a `push()`-method that will be called whenever new entries are received
   **/
  function UseClientHydrationStreamProvider(props) {
    // unique id for the cache provider
    const id = `__RQ${React.useId()}`;
    const idJSON = JSON.stringify(id);
    const [transformer] = React.useState(() => {
      var _props$transformer;
      return (_props$transformer = props.transformer) != null ? _props$transformer : {
        // noop
        serialize: obj => obj,
        deserialize: obj => obj
      };
    });

    // <server stuff>
    const [stream] = React.useState(() => {
      if (typeof window !== 'undefined') {
        return {
          push() {
            // no-op on the client
          }
        };
      }
      return [];
    });
    const count = React.useRef(0);
    useServerInsertedHTML(() => {
      var _props$onFlush;
      // This only happens on the server
      stream.push(...((_props$onFlush = props.onFlush == null ? void 0 : props.onFlush()) != null ? _props$onFlush : []));
      if (!stream.length) {
        return null;
      }
      // console.log(`pushing ${stream.length} entries`)
      const serializedCacheArgs = stream.map(entry => transformer.serialize(entry)).map(entry => JSON.stringify(entry)).join(',');

      // Flush stream
      stream.length = 0;
      const html = [`window[${idJSON}] = window[${idJSON}] || [];`, `window[${idJSON}].push(${serializedCacheArgs});`];
      return /*#__PURE__*/React.createElement("script", {
        key: count.current++,
        dangerouslySetInnerHTML: {
          __html: html.join('')
        }
      });
    });
    // </server stuff>

    // <client stuff>
    const onEntriesRef = React.useRef(props.onEntries);
    React.useEffect(() => {
      onEntriesRef.current = props.onEntries;
    });
    React.useEffect(() => {
      var _win$id;
      // Client: consume cache:
      const onEntries = (...serializedEntries) => {
        const entries = serializedEntries.map(serialized => transformer.deserialize(serialized));
        onEntriesRef.current(entries);
      };
      const win = window;
      // Register cache consumer
      const winStream = (_win$id = win[id]) != null ? _win$id : [];
      onEntries(...winStream);

      // Register our own consumer
      win[id] = {
        push: onEntries
      };
      return () => {
        // Cleanup after unmount
        win[id] = [];
      };
    }, [id, transformer]);
    // </client stuff>

    return /*#__PURE__*/React.createElement(context.Provider, {
      value: {
        stream,
        id
      }
    }, props.children);
  }
  return {
    Provider: UseClientHydrationStreamProvider,
    context
  };
}

export { createHydrationStreamProvider };
//# sourceMappingURL=HydrationStreamProvider.legacy.js.map
