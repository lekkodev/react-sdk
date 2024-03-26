import { type EvaluationType } from "../utils/types"
import { type ClientContext, type RepositoryKey } from "@lekko/js-sdk"

interface PrintConfigProps {
  intro: string
  evaluationType: EvaluationType
  namespaceName: string
  configName: string
  context?: ClientContext | undefined
  repositoryKey?: RepositoryKey
}

export function printConfigMessage({
  intro,
  evaluationType,
  namespaceName,
  configName,
  context,
  repositoryKey,
}: PrintConfigProps) {
  const repoString =
    repositoryKey === undefined
      ? ""
      : `\nrepository: ${repositoryKey.toJsonString()}`
  return `${intro}:\ntype: ${evaluationType}\nnamespace: ${namespaceName}\nconfig name: ${configName}\ncontext: ${
    context?.toString() ?? "no context"
  }${repoString}`
}
