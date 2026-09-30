import { z } from "zod";

export const workloadSchema = z.object({
  courseId: z.string().min(1),
  excludedProvider: z.string().min(1),
  workloads: z.array(z.enum([
    "course_delivery",
    "learner_deadlines",
    "educator_reporting"
  ])).min(1)
});

export type WorkloadRequest = z.infer<typeof workloadSchema>;

export type RoutingDecision = {
  courseId: string;
  routes: Array<{
    capability: WorkloadRequest["workloads"][number];
    excludedProvider: string;
    status: "configured";
  }>;
};

export function buildRoutingDecision(input: WorkloadRequest): RoutingDecision {
  return {
    courseId: input.courseId,
    routes: input.workloads.map((capability) => ({
      capability,
      excludedProvider: input.excludedProvider,
      status: "configured"
    }))
  };
}
