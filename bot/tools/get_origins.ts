import { defineTool } from "@grok/agent-sdk/tools";
import { z } from "zod";
import { origins, sources, STAND_IN_NOTICE } from "../lib/fixtures.js";
import { requireKnownService } from "../lib/service.js";

export default defineTool({
  description:
    "Read the origin pools a service downloads packages from: status in config, newest synced package, sync state, spare capacity, maintenance windows, and which regions each pool serves.",
  inputSchema: z.object({
    service: z.string().describe("Service name, for example update-relay."),
  }),
  effect: "read",
  async execute({ service }) {
    requireKnownService(service);
    return {
      source: `Origin inventory and ${sources.originsFile}`,
      notice: STAND_IN_NOTICE,
      ...origins,
    };
  },
});
