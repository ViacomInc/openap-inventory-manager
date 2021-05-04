import { NextApiRequest, NextApiResponse } from "next";
import { AuthenticationError } from "apollo-server-micro";
import type { User } from "../app/store/types";

export interface Auth extends User {
  id: string;
}

export interface WithAuth {
  auth?: Auth;
}

export type Handler = (
  req: NextApiRequest & WithAuth,
  res: NextApiResponse
) => Promise<void>;

export interface NextContext {
  req: NextApiRequest & WithAuth;
  res: NextApiResponse;
}

export interface Context {
  auth: Auth;
}

export function withAuth(ctx: NextContext): Context {
  if (!ctx.req.auth || !ctx.req.auth.id) {
    throw new AuthenticationError("Forbidden");
  }

  return {
    auth: ctx.req.auth,
  };
}

export function adminOnly<R>(auth: Auth, next: () => R): R {
  if (!auth.isAdmin) {
    throw new AuthenticationError(
      "You must have permissions to query this schema"
    );
  }

  return next();
}
