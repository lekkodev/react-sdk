import { type Any } from "@bufbuild/protobuf"
import { type Client } from "@lekko/js-sdk"
import { ClientContext, RepositoryKey } from "@lekko/js-sdk"
import { NoDefaultProvidedError } from "../errors/types"

export class NoOpClient implements Client {
  public repository: RepositoryKey

  constructor(repositoryOwner: string, repositoryName: string) {
    this.repository = RepositoryKey.fromJson({
      ownerName: repositoryOwner,
      repoName: repositoryName,
    })
  }

  async close(): Promise<void> {}

  async getBool(
    namespace: string,
    key: string,
    ctx: ClientContext = new ClientContext(),
  ): Promise<boolean> {
    throw new NoDefaultProvidedError(
      `No bool default value provided for ${key}`,
    )
  }

  async getInt(
    namespace: string,
    key: string,
    ctx: ClientContext = new ClientContext(),
  ): Promise<bigint> {
    throw new NoDefaultProvidedError(`No int default value provided for ${key}`)
  }

  async getFloat(
    namespace: string,
    key: string,
    ctx: ClientContext = new ClientContext(),
  ): Promise<number> {
    throw new NoDefaultProvidedError(
      `No float default value provided for ${key}`,
    )
  }

  async getJSON(
    namespace: string,
    key: string,
    ctx: ClientContext = new ClientContext(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    throw new NoDefaultProvidedError(
      `No JSON default value provided for ${key}`,
    )
  }

  async getProto(
    namespace: string,
    key: string,
    ctx: ClientContext = new ClientContext(),
  ): Promise<Any> {
    throw new NoDefaultProvidedError(
      `No proto default value provided for ${key}`,
    )
  }

  async getString(
    namespace: string,
    key: string,
    ctx: ClientContext = new ClientContext(),
  ): Promise<string> {
    throw new NoDefaultProvidedError(
      `No string default value provided for ${key}`,
    )
  }
}
