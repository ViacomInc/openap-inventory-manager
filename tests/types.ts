import { NextApiResponse, NextApiRequest } from "next";

export { NextApiRequest, NextApiResponse };

export type Handler = (
  req: NextApiRequestWithAuth,
  res: NextApiResponse
) => Promise<void>;

export interface RequestWithAuth {
  auth: { id: string };
}

export type NextApiRequestWithAuth = NextApiRequest & RequestWithAuth;

export type NextCtx = {
  req: NextApiRequestWithAuth;
  res: NextApiResponse;
};
