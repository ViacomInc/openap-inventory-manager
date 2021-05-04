import { Handler, NextApiRequestWithAuth, NextApiResponse } from "./types";

import { TEST_USER_ID } from "./constants";

export type HandlerWithConfig = Handler & {
  config?: {
    api: {
      bodyParser: boolean;
    };
  };
};

const fakeAuth = {
  id: TEST_USER_ID,
  isAdmin: true,
};

export default function mockAutheticated(handler: Handler): Handler {
  return async (
    req: NextApiRequestWithAuth,
    res: NextApiResponse
  ): Promise<void> => {
    req.auth = fakeAuth;
    return handler(req, res);
  };
}
