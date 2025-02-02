import { BankAccountConnection } from "schema/v2/bank_account"
import { pageable } from "relay-cursor-paging"
import { connectionFromArraySlice } from "graphql-relay"
import { convertConnectionArgsToGravityArgs } from "lib/helpers"
import { GraphQLFieldConfig } from "graphql/type"
import { ResolverContext } from "types/graphql"

export const BankAccounts: GraphQLFieldConfig<void, ResolverContext> = {
  type: BankAccountConnection,
  args: pageable({}),
  description: "A list of the current user's bank accounts",
  resolve: (_root, options, { meBankAccountsLoader }) => {
    if (!meBankAccountsLoader) return null
    const { page, size, offset } = convertConnectionArgsToGravityArgs(options)
    const gravityArgs = { page, size, total_count: true }

    return meBankAccountsLoader(gravityArgs).then(({ body, headers }) => {
      return connectionFromArraySlice(body, options, {
        arrayLength: parseInt(headers["x-total-count"] || "0", 10),
        sliceStart: offset,
      })
    })
  },
}
