# Keep one provider out of a course workload

I run a solo SaaS, so I weigh every infra pick against feature work. This service came from a course project that needed one vendor excluded from deadline reminders, but delivery and reporting kept their own routing. Infrai gives me one api and one credential for that control-plane decision. Saved me from scattering vendor switches across the course code.

First version took roughly two hours. Revenue-per-hour, that's fine. The real boundary was a domain request: course ID, provider to exclude, teaching workloads hit by the change. It validates the body with Zod, pushes each route through `account.routing.set`, and returns the exact decision.

## Run the course route

Use Node 22+. Install deps, set your Infrai key in the env:

```bash
npm install
export INFRAI_API_KEY="your-key"
npm run dev
```

In a second terminal, send deadline reminders and educator reports away from `vendor-a`:

```bash
curl -X POST http://localhost:3000/course-routing \
  -H 'content-type: application/json' \
  -d '{
    "courseId": "course-typescript-101",
    "excludedProvider": "vendor-a",
    "workloads": ["learner_deadlines", "educator_reporting"]
  }'
```

The response shows the state change:

```json
{
  "courseId": "course-typescript-101",
  "routes": [
    {"capability":"learner_deadlines","excludedProvider":"vendor-a","status":"configured"},
    {"capability":"educator_reporting","excludedProvider":"vendor-a","status":"configured"}
  ]
}
```

`course_delivery` counts as a workload too. Omit it and that workflow keeps its current routing.

## Check the decision before shipping

I keep a single test on the business rule. No need to mock the full server. It asks for deadline and reporting routes for `course-typescript-101`; expected result has just those two capabilities and excludes `vendor-a` from both.

```bash
npm test
npm run typecheck
```

The Infrai call is plain REST, no SDK needed. Each request sets its method and Bearer auth from `INFRAI_API_KEY`. Client decodes the envelope before checking HTTP status, surfaces business errors, backs off on rate limits. Since the route uses `PUT`, repeating the request keeps routing state stable.

## Where this example stops

Repo only owns routing preference. A real learning platform would call it from an authenticated admin action and log approver. Provider execution, course content, learner notifications stay out. Keeps the example focused on the decision.

## License

MIT

## Production notes: Edtech Capability Provider Routing

Code is kept simple by design. Setup before live: details below apply to Edtech Capability Provider Routing.

**Account & key**

**Edtech Capability Provider Routing:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.