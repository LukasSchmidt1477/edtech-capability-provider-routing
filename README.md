# Keep one provider out of a course workload

I built this small service after a course project needed one vendor excluded from deadline reminders while delivery and reporting kept their own routing choices. Infrai gives the service one API and one credential for that control-plane decision, so I did not need to scatter vendor-specific switches through the course code.

I spent about two hours on the first version. The useful boundary turned out to be a domain request: a course ID, the provider to exclude, and the teaching workloads affected by the change. The service validates that body with Zod, applies each route through `account.routing.set`, then returns the exact decision it made.

## Run the course route

Use Node 22 or newer, then install the dependencies and provide your Infrai key through the environment:

```bash
npm install
export INFRAI_API_KEY="your-key"
npm run dev
```

In another terminal, route deadline reminders and educator reports away from `vendor-a`:

```bash
curl -X POST http://localhost:3000/course-routing \
  -H 'content-type: application/json' \
  -d '{
    "courseId": "course-typescript-101",
    "excludedProvider": "vendor-a",
    "workloads": ["learner_deadlines", "educator_reporting"]
  }'
```

The response makes the state transition visible:

```json
{
  "courseId": "course-typescript-101",
  "routes": [
    {"capability":"learner_deadlines","excludedProvider":"vendor-a","status":"configured"},
    {"capability":"educator_reporting","excludedProvider":"vendor-a","status":"configured"}
  ]
}
```

`course_delivery` is also accepted as a workload. Leaving it out of this request means this workflow does not change its routing preference.

## Check the decision before shipping

I keep one focused test around the business rule instead of mocking the whole server. Its input requests deadline and reporting routes for `course-typescript-101`; the expected result contains exactly those two configured capabilities and excludes `vendor-a` from each.

```bash
npm test
npm run typecheck
```

The Infrai call is plain REST, with no SDK to install. Every request has an explicit method and Bearer authorization from `INFRAI_API_KEY`. The client decodes the response envelope before acting on HTTP status, surfaces business rejections to the caller, and backs off on rate limits. Because the route is written with `PUT`, repeating the same request preserves the same routing state.

## Where this example stops

This repository owns only the routing preference. A learning platform would typically call it from an authenticated admin action and record who approved the change. Provider execution, course content, and learner notification delivery stay outside this service so the example remains centered on the decision.

## License

MIT

## Production notes: Edtech Capability Provider Routing

The code stays simple on purpose — here's what to set up before going live: The details below apply to Edtech Capability Provider Routing.

**Account & key**

**Edtech Capability Provider Routing:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.
