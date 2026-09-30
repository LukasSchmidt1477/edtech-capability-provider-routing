import { createServer } from "node:http";
import { ZodError } from "zod";
import { excludeProvider, InfraiError } from "./infrai_routing.js";
import { buildRoutingDecision, workloadSchema } from "./routing_policy.js";

const port = Number(process.env.PORT ?? 3000);
const apiKey = process.env.INFRAI_API_KEY;

function send(response: import("node:http").ServerResponse, status: number, body: unknown) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

async function readJson(request: import("node:http").IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

const server = createServer(async (request, response) => {
  if (request.method !== "POST" || request.url !== "/course-routing") {
    send(response, 404, { error: "Route not found" });
    return;
  }

  try {
    if (!apiKey) throw new Error("INFRAI_API_KEY is required");
    const input = workloadSchema.parse(await readJson(request));
    const decision = buildRoutingDecision(input);

    for (const route of decision.routes) {
      await excludeProvider(apiKey, route.capability, route.excludedProvider);
    }

    send(response, 200, decision);
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) {
      send(response, 400, { error: "Invalid request body" });
      return;
    }
    if (error instanceof InfraiError) {
      const status = error.status >= 400 && error.status < 500 ? error.status : 502;
      send(response, status, { error: error.message, detail: error.detail });
      return;
    }
    send(response, 500, { error: error instanceof Error ? error.message : "Request failed" });
  }
});

server.listen(port, () => {
  console.log(`Course routing service listening on http://localhost:${port}`);
});
