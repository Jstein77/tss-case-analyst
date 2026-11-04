import { defineTool } from "@grok/agent-sdk/tools";
import { z } from "zod";
import { alarms, STAND_IN_NOTICE } from "../lib/fixtures.js";
import { requireKnownService } from "../lib/service.js";

export default defineTool({
  description:
    "Read monitoring alarms for a service: state, when it changed, threshold, current value and recent datapoints. Filter by region to compare the affected region with healthy ones.",
  inputSchema: z.object({
    service: z.string().describe("Service name, for example update-relay."),
    region: z.string().optional().describe("Region, for example us-east-1. Omit to see every region."),
  }),
  effect: "read",
  async execute({ service, region }) {
    const name = requireKnownService(service);
    const matches = alarms.filter(
      (a) => a.service === name && (region === undefined || a.region === region.trim().toLowerCase()),
    );
    return {
      source: `Monitoring, ${name} alarms`,
      notice: STAND_IN_NOTICE,
      alarms: matches,
    };
  },
});
