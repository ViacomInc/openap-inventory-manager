/**
 * @property logValues Dictates whether to include parameter values used to execute the query. (default: true)
 */
type UserConfigurationType = {
  logValues: boolean;
};

declare module "slonik-interceptor-query-logging" {
  import { InterceptorType } from "slonik";
  function createQueryLoggingInterceptor(
    userConfig?: UserConfigurationType
  ): InterceptorType;
}
