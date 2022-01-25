import { v4 as uuid } from "uuid";
import {
  runOnce,
  makeWorkerUtils,
  Logger,
  LogFunctionFactory,
  Job,
  TaskList,
} from "graphile-worker";
import { LogFn } from "pino";
import logger from "../logger";

import { WORKER_CONCURRENCY } from "../constants";

import { Tasks, TaskName, TasksPayloads } from "./tasks";
export { TaskName } from "./tasks";

const logFactory: LogFunctionFactory = (scope) => {
  const workerLogger = logger.child({
    ...scope,
    name: "worker",
  }) as unknown as Record<string, LogFn>; // have to do it :(

  return (level, message, meta?) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    workerLogger[level]({ ...meta }, message);
  };
};

function getTaskId(taskId: string, taskName: string): string {
  return `${taskName}.${taskId}`;
}

export async function runJobsOnce(taskList: TaskList): Promise<void> {
  return runOnce({
    concurrency: WORKER_CONCURRENCY,
    pollInterval: 5000,
    logger: new Logger(logFactory),
    connectionString: process.env.POSTGRES_URI ?? "",
    taskList,
  });
}

type FailedJobs = Array<{
  id: string;
  taskName: TaskName;
  payload: unknown;
  error: unknown;
}>;

export async function runJobs(
  tasksPayloads: TasksPayloads
): Promise<FailedJobs | null> {
  const utils = await makeWorkerUtils({
    connectionString: process.env.POSTGRES_URI ?? "",
  });

  try {
    const id = uuid();
    const jobsIds: string[] = [];
    const taskList: TaskList = {};

    for await (const [taskName, payloads] of Object.entries(tasksPayloads)) {
      if (!(payloads && payloads.length)) {
        continue;
      }

      const taskId = getTaskId(id, taskName);
      taskList[taskId] = Tasks[taskName as TaskName];
      for await (const payload of payloads) {
        const job = await utils.addJob(taskId, payload);
        jobsIds.push(job.id);
      }
    }

    await runJobsOnce(taskList);

    // deletes and returns failed jobs
    const failedJobs = await utils.completeJobs(jobsIds);
    if (!failedJobs.length) {
      return null;
    }

    return failedJobs.reduce(makeResults, []);
  } finally {
    await utils.release();
  }
}

function makeResults(
  results: FailedJobs,
  { id, task_identifier, last_error, payload }: Job
): FailedJobs {
  results.push({
    id,
    taskName: task_identifier.split(".")[1] as TaskName,
    error: last_error ? JSON.parse(last_error) : "",
    payload,
  });
  return results;
}
