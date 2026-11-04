import { defineTool } from "@grok/agent-sdk/tools";
import { z } from "zod";
import { cases, STAND_IN_NOTICE } from "../lib/fixtures.js";

export default defineTool({
  description:
    "Read one support case: customer, priority, product, region, when it opened, and the customer's own description. Closed cases also include the root cause and resolution. Call this first for any case you are asked about.",
  inputSchema: z.object({
    caseId: z.string().describe("Case ID, for example TSS-48213."),
  }),
  effect: "read",
  async execute({ caseId }) {
    const id = caseId.trim().toUpperCase();
    const found = cases.find((c) => c.id === id);
    if (!found) {
      throw new Error(
        `No case ${caseId} in the case system. Known case IDs: ${cases.map((c) => c.id).join(", ")}.`,
      );
    }
    return { source: `Case system, ${found.id}`, notice: STAND_IN_NOTICE, case: found };
  },
});
