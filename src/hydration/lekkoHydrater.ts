import { Client } from "@lekko/js-sdk";
import { dehydrate, DehydratedState, QueryClient } from "@tanstack/react-query";
import { EvaluationType, LekkoConfig, LekkoSettings } from "..";
import { init } from "../hooks/useLekkoClient";
import { getEvaluation } from "../utils/evaluation";
import { createStableKey } from "../utils/helpers";

export class LekkoHydrater {
    client: Client
    dehydratedState: DehydratedState | undefined
    configs: LekkoConfig<EvaluationType>[]

    constructor(settings: LekkoSettings, configs: LekkoConfig<EvaluationType>[]) {
        this.client = init({ settings })
        this.configs = configs
    }

    async getDehydratedState() {
        if (this.dehydratedState) {
            return this.dehydratedState
        }

        const queryClient = new QueryClient();

        await Promise.all(this.configs.map(async config => {
            const key = createStableKey(config, this.client.repository)
            const result = await queryClient.prefetchQuery({
                queryKey: key,
                queryFn: async () => await getEvaluation(this.client, config)
            })
            console.log('getting result')
            console.log(result)
            return result
        }))
        
        this.dehydratedState = dehydrate(queryClient);
    }
}