import { describe, expect, it } from "vitest";
import { buildRoutingDecision, workloadSchema } from "../src/routing_policy.js";

describe("course workload routing", () => {
  it("excludes the selected provider only for requested teaching capabilities", () => {
    const input = workloadSchema.parse({
      courseId: "course-typescript-101",
      excludedProvider: "vendor-a",
      workloads: ["learner_deadlines", "educator_reporting"]
    });

    expect(buildRoutingDecision(input)).toEqual({
      courseId: "course-typescript-101",
      routes: [
        {
          capability: "learner_deadlines",
          excludedProvider: "vendor-a",
          status: "configured"
        },
        {
          capability: "educator_reporting",
          excludedProvider: "vendor-a",
          status: "configured"
        }
      ]
    });
  });
});
