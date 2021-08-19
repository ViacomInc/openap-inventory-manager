import { GetPublishers } from "../../graphql/operations/publishers.graphql";
import type {
  GetPublishersQueryResult,
  GetPublishersQueryVariables,
} from "../graphql";

import { State, Dispatch } from "../store/";
import { graphqlRequest, setPublishers } from "../store/actions";
import { RequestWithData } from "../store/requests";
import { PublishersSlice } from "../store/publishers";

export const getPublishersRequest = (): ((dispatch: Dispatch) => void) =>
  graphqlRequest<
    GetPublishersQueryResult,
    GetPublishersQueryVariables,
    "publishers"
  >({
    key: `getPublishers`,
    result: "publishers",
    document: GetPublishers,
    dispatchTo: setPublishers,
  });

export const selectGetPublishersRequest =
  () =>
  (state: State): RequestWithData<PublishersSlice> => ({
    ...state.requests[`getPublishers`],
    data: state.publishers,
  });
