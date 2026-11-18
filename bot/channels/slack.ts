import { slackChannel } from "@grok/agent-sdk/channels/slack";

// Reads TSS_CASE_ANALYST_SLACK_BOT_TOKEN and TSS_CASE_ANALYST_SLACK_APP_TOKEN.
export default slackChannel({
  envPrefix: "TSS_CASE_ANALYST",
  suggestedPrompts: [{ title: "Help", message: "How can you help me?" }],
});
