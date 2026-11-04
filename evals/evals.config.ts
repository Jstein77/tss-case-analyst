import { defineEvalConfig } from "@grok/agent-sdk/evals";

export default defineEvalConfig({
  maxConcurrency: 3,
  timeoutMs: 300_000,
});
