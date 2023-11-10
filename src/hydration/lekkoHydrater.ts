import { type Client } from "@lekko/js-sdk"
import {
  dehydrate,
  type DehydratedState,
  QueryClient,
} from "@tanstack/react-query"
import { type EvaluationType, type LekkoConfig, type LekkoSettings } from ".."
import { init } from "../hooks/useLekkoClient"
import { getEvaluation } from "../utils/evaluation"
import { createStableKey } from "../utils/helpers"

export class LekkoHydrater {
  client: Client
  dehydratedState: DehydratedState | undefined
  configs: Array<LekkoConfig<EvaluationType>>

  constructor(
    settings: LekkoSettings,
    configs: Array<LekkoConfig<EvaluationType>>,
  ) {
    this.client = init({ settings })
    this.configs = configs
  }

  async getDehydratedState() {
    if (this.dehydratedState !== undefined) {
      return this.dehydratedState
    }

    const queryClient = new QueryClient()

    await Promise.all(
      this.configs.map(async (config) => {
        const key = createStableKey(config, this.client.repository)
        await queryClient.prefetchQuery({
          queryKey: key,
          queryFn: async () => await getEvaluation(this.client, config),
        })
      }),
    )

    this.dehydratedState = dehydrate(queryClient)

    queryClient.clear()
  }
}
