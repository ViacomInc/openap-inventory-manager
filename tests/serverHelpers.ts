import { createServer, Server } from "http";
export type { Server } from "http";
import { ApolloServer, AuthenticationError } from "apollo-server-micro";
import { NextApiResponse, NextApiRequest } from "next";
import {
  apiResolver,
  __ApiPreviewProps,
} from "next/dist/next-server/server/api-utils";

import schema from "../src/graphql/__generated__/schema.graphql";
import createResolvers, { CreateResolvers } from "../src/graphql/resolvers";
import { withAuth } from "../src/graphql/context";

import mockAutheticated, { HandlerWithConfig } from "./mockAuthenticated";
import { GRAPHQL_API_URL } from "../src/app/config";
import { NextCtx, RequestWithAuth } from "./types";

export function getGraphQLSettings(portShift: number = 0) {
  const port = parseInt(process.env.PORT || "8081", 10) + portShift;
  const url = `http://localhost:${port}${GRAPHQL_API_URL}`;

  return {
    path: GRAPHQL_API_URL,
    url,
    port,
  };
}

interface StartGraphQLServer extends CreateResolvers {
  path: string;
  port: number;
}

export async function startGraphQLServer({
  path,
  port,
  importItems,
}: StartGraphQLServer): Promise<Server> {
  return new Promise((resolve) => {
    const apolloServer = new ApolloServer({
      typeDefs: [schema],
      resolvers: createResolvers({ importItems }),
      context: withAuth,
    });

    const handler = apolloServer.createHandler({ path });
    const graphQLHandler = mockAutheticated(handler) as HandlerWithConfig;
    graphQLHandler.config = { api: { bodyParser: false } };

    const server = createServer((req, res) => {
      if (req.url === path) {
        void apiResolver(
          req,
          res,
          undefined,
          graphQLHandler,
          {} as __ApiPreviewProps,
          true
        );
      }
    }).on("error", (e) => console.error(e));

    server.listen(port, () => resolve(server));
  });
}

export async function stopGraphQLServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
