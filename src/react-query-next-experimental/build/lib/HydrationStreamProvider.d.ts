import * as React from 'react';
interface DataTransformer {
    serialize(object: any): any;
    deserialize(object: any): any;
}
interface HydrationStreamContext<TShape> {
    id: string;
    stream: {
        /**
         * **Server method**
         * Push a new entry to the stream
         * Will be ignored on the client
         */
        push: (...shape: TShape[]) => void;
    };
}
export interface HydrationStreamProviderProps<TShape> {
    children: React.ReactNode;
    /**
     * Optional transformer to serialize/deserialize the data
     * Example devalue, superjson et al
     */
    transformer?: DataTransformer;
    /**
     * **Client method**
     * Called in the browser when new entries are received
     */
    onEntries: (entries: TShape[]) => void;
    /**
     * **Server method**
     * onFlush is called on the server when the cache is flushed
     */
    onFlush?: () => TShape[];
}
export declare function createHydrationStreamProvider<TShape>(): {
    Provider: (props: {
        children: React.ReactNode;
        /**
         * Optional transformer to serialize/deserialize the data
         * Example devalue, superjson et al
         */
        transformer?: DataTransformer | undefined;
        /**
         * **Client method**
         * Called in the browser when new entries are received
         */
        onEntries: (entries: TShape[]) => void;
        /**
         * **Server method**
         * onFlush is called on the server when the cache is flushed
         */
        onFlush?: (() => TShape[]) | undefined;
    }) => React.JSX.Element;
    context: React.Context<HydrationStreamContext<TShape>>;
};
export {};
//# sourceMappingURL=HydrationStreamProvider.d.ts.map