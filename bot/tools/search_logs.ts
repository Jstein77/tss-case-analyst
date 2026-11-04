import { defineTool } from "@grok/agent-sdk/tools";
import { z } from "zod";
import { logs, logStats, STAND_IN_NOTICE } from "../lib/fixtures.js";
import { requireKnownService } from "../lib/service.js";

export default defineTool({
  description:
    "Search a service's logs. Returns matching log lines, oldest first, plus an aggregate summary per region. Terms match any word in the line, so search for status codes, package names, origin names or words like failed, reloaded, alarm.",
  inputSchema: z.object({
    service: z.string().describe("Service name, for example update-relay."),
    region: z.string().optional().describe("Region, for example us-east-1. Omit to search every region."),
    query: z
      .string()
      .optional()
      .describe("Space-separated search terms. A line matches when it contains any term. Omit to list every line."),
    limit: z.number().int().min(1).max(50).optional().describe("Maximum lines to return. Defaults to 20."),
  }),
  effect: "read",
  async execute({ service, region, query, limit }) {
    const name = requireKnownService(service);
    const wantedRegion = region?.trim().toLowerCase();
    const terms = (query ?? "")
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 0);

    const inRegion = logs.filter((line) => wantedRegion === undefined || line.region === wantedRegion);
    const matches = inRegion.filter((line) => {
      if (terms.length === 0) {
        return true;
      }
      const text = `${line.level} ${line.message}`.toLowerCase();
      return terms.some((term) => text.includes(term));
    });

    return {
      source: `Logs, ${name}${wantedRegion ? ` ${wantedRegion}` : ""}`,
      notice: STAND_IN_NOTICE,
      summary: wantedRegion ? { [wantedRegion]: logStats[wantedRegion] ?? "No logs for this region." } : logStats,
      totalMatches: matches.length,
      lines: matches.slice(0, limit ?? 20),
    };
  },
});
