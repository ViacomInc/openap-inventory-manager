import { request, ClientError } from "graphql-request";
import { DocumentNode } from "graphql";
import { GRAPHQL_API_URL } from "../../config";
import {
  Dispatch,
  ActionCreatorWithoutPayload,
  ActionCreatorWithPayload,
  AsyncActionCreatorWithPayload,
  AsyncActionCreatorWithoutPayload,
  isAsyncActionCreator,
} from "../";
import { actions, RequestAction } from "./";

interface GraphQLRequest<
  Results,
  Variables,
  Result extends string & keyof Results
> {
  key: string;
  result: Result;
  document: DocumentNode;
  variables?: Variables;
  willDispatchTo?:
    | ActionCreatorWithoutPayload
    | AsyncActionCreatorWithoutPayload;
  dispatchTo:
    | ActionCreatorWithPayload<Results[Result]>
    | AsyncActionCreatorWithPayload<Results[Result]>;
  didDispatchTo?:
    | ActionCreatorWithoutPayload
    | AsyncActionCreatorWithoutPayload;
}

export function clearRequest(key: string): RequestAction {
  return actions.set({
    key,
    request: {
      loading: false,
      errors: [],
    },
  });
}

export function graphqlRequest<
  Results,
  Variables,
  Result extends string & keyof Results
>({
  key,
  result,
  document,
  variables,
  dispatchTo,
  willDispatchTo,
  didDispatchTo,
}: GraphQLRequest<Results, Variables, Result>) {
  return (dispatch: Dispatch): Promise<void> => {
    dispatch(
      actions.set({
        key,
        request: {
          loading: true,
          errors: [],
        },
      })
    );

    return request<Results>(GRAPHQL_API_URL, document, variables)
      .then((data) => data[result])
      .then((data) => {
        // for some reason it matters to dispatch
        // there should be more elegant solution
        if (willDispatchTo) {
          if (isAsyncActionCreator(willDispatchTo)) {
            dispatch(willDispatchTo());
          } else {
            dispatch(willDispatchTo());
          }
        }

        if (isAsyncActionCreator(dispatchTo)) {
          dispatch(dispatchTo(data));
        } else {
          dispatch(dispatchTo(data));
        }

        if (didDispatchTo) {
          if (isAsyncActionCreator(didDispatchTo)) {
            dispatch(didDispatchTo());
          } else {
            dispatch(didDispatchTo());
          }
        }

        dispatch(
          actions.set({
            key,
            request: {
              loading: false,
              errors: [],
            },
          })
        );
      })
      .catch((e: ClientError) => {
        const code = e.response.status;
        const errors = e.response.errors?.map((error) => ({
          code,
          message: error.message,
        }));

        dispatch(
          actions.set({
            key,
            request: {
              loading: false,
              errors:
                errors && errors.length
                  ? errors
                  : [
                      {
                        code,
                        message: e.message,
                      },
                    ],
            },
          })
        );
      });
  };
}
