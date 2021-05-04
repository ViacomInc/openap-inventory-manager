import { v4 as uuid } from "uuid";
import {
  runOnce,
  makeWorkerUtils,
  Logger,
  LogFunctionFactory,
  TaskList,
} from "graphile-worker";
import logger from "../logger";

import { WORKER_CONCURRENCY } from "../constants";

import { TaskName, Tasks } from "./tasks";
export { TaskName } from "./tasks";

const logFactory: LogFunctionFactory = (scope) => {
  const workerLogger = logger.child({ ...scope, name: "worker" });

  return (level, message, meta?) => {
    workerLogger[level]({ ...meta }, message);
  };
};

export interface Job {
  id: string;
  taskName: TaskName;
}

export type Tasks = Partial<Record<TaskName, unknown[]>>;

function getTaskName(id: string, taskName: TaskName): string {
  return `${taskName}.${id}`;
}

function createTaskList(taskList: TaskList, job: Job): TaskList {
  taskList[getTaskName(job.id, job.taskName)] = Tasks[job.taskName];
  return taskList;
}

export async function runJobs(jobs: Job[]): Promise<void> {
  return runOnce({
    concurrency: WORKER_CONCURRENCY,
    pollInterval: 5000,
    logger: new Logger(logFactory),
    connectionString: process.env.POSTGRES_URI ?? "",
    taskList: jobs.reduce(createTaskList, {}),
  });
}

export async function addJobs(tasks: Tasks): Promise<Job[]> {
  const utils = await makeWorkerUtils({
    connectionString: process.env.POSTGRES_URI ?? "",
  });

  const runnerId = uuid();
  const jobs: Job[] = [];
  try {
    for await (const [taskName, payloads] of Object.entries(tasks)) {
      if (payloads === undefined) {
        continue;
      }
      const taskId = getTaskName(runnerId, taskName as TaskName);
      for await (const payload of payloads) {
        await utils.addJob(taskId, payload);
      }
      jobs.push({
        id: runnerId,
        taskName: taskName as TaskName,
      });
    }
  } finally {
    await utils.release();
  }

  return jobs;
}
