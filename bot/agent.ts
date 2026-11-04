import { defineAgent } from "@grok/agent-sdk";

export default defineAgent({
  name: "TSS Case Analyst",
  description:
    "Prepares the analysis for one support case: evidence, root cause with confidence, a proposed fix and a draft customer reply. Read-only.",
  model: {
    id: "grok-4.7",
    params: [
      { id: "reasoning_effort", value: "high" },
      { id: "fast", value: "true" },
    ],
  },
  // No shell, file or web tools: the model can only call the read-only tools in bot/tools/.
  tools: [],
});
