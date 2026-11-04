import { defineTool } from "@grok/agent-sdk/tools";
import { z } from "zod";
import { configHistory, sources, STAND_IN_NOTICE } from "../lib/fixtures.js";
import { requireKnownService } from "../lib/service.js";

export default defineTool({
  description:
    "List recent commits to a service's repository, newest first, with author, time, message, changed files, the diff, and when each commit reached production. Use it to find changes made shortly before a problem started.",
  inputSchema: z.object({
    service: z.string().describe("Service name, for example update-relay."),
    path: z.string().optional().describe("Only commits that touch this file, for example config/regions.json."),
    limit: z.number().int().min(1).max(20).optional().describe("Maximum commits to return. Defaults to 10."),
  }),
  effect: "read",
  async execute({ service, path, limit }) {
    const name = requireKnownService(service);
    const commits = configHistory.filter((c) => path === undefined || c.files.includes(path.trim()));
    return {
      source: `Git history, ${sources.repo}`,
      notice: STAND_IN_NOTICE,
      service: name,
      repo: sources.repo,
      commits: commits.slice(0, limit ?? 10),
    };
  },
});
