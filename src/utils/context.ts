import { ClientContext } from "@lekko/js-sdk";

export function getCombinedContext(context: ClientContext | undefined, overrides: ClientContext) {
    if (context === undefined) return overrides
    const combined = new ClientContext()
    combined.data = {
        ...context.data,
        ...overrides.data
    }
    return combined
}