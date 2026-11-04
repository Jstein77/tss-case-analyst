import { defineTool } from "@grok/agent-sdk/tools";
import { z } from "zod";
import { cases, STAND_IN_NOTICE } from "../lib/fixtures.js";

const STOPWORDS = new Set(["the", "and", "for", "can", "cant", "not", "with", "our", "are", "from", "after"]);

function terms(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9.-]+/)
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
}

export default defineTool({
  description:
    "Find past support cases with similar symptoms. Returns the best matches with their root cause and resolution. Pass the symptoms in plain words and exclude the case you are analyzing.",
  inputSchema: z.object({
    query: z.string().describe("Symptoms, for example: pattern download 404 package not found."),
    excludeCaseId: z.string().optional().describe("Case ID to leave out, usually the current case."),
    limit: z.number().int().min(1).max(10).optional().describe("Maximum matches. Defaults to 3."),
  }),
  effect: "read",
  async execute({ query, excludeCaseId, limit }) {
    const wanted = new Set(terms(query));
    const exclude = excludeCaseId?.trim().toUpperCase();
    const ranked = cases
      .filter((c) => c.id !== exclude)
      .map((c) => {
        const haystack = new Set(
          terms([c.subject, c.description, c.region, c.rootCause ?? "", ...c.tags].join(" ")),
        );
        const matched = [...wanted].filter((t) => haystack.has(t));
        return { c, matched };
      })
      .filter((r) => r.matched.length > 0)
      .sort((a, b) => b.matched.length - a.matched.length)
      .slice(0, limit ?? 3);

    return {
      source: "Case system, similar-case search",
      notice: STAND_IN_NOTICE,
      matches: ranked.map(({ c, matched }) => ({
        id: c.id,
        customer: c.customer,
        region: c.region,
        status: c.status,
        openedAt: c.openedAt,
        subject: c.subject,
        rootCause: c.rootCause,
        resolution: c.resolution,
        matchedTerms: matched,
      })),
    };
  },
});
