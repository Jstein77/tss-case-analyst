# TSS Case Analyst

Agent SDK agent (deployment slug `tss-case-analyst`) that prepares the analysis for one support case.

## Slack

`bot/channels/slack.ts` adds a Slack channel: @mention the bot in a channel or DM it, and it replies in a thread. Follow-ups in that thread continue the same session.

The channel reads two tokens:

| Secret | Value |
| --- | --- |
| `TSS_CASE_ANALYST_SLACK_BOT_TOKEN` | Bot user OAuth token (`xoxb-…`) |
| `TSS_CASE_ANALYST_SLACK_APP_TOKEN` | App-level token (`xapp-…`) with `connections:write` |

The Slack app uses Socket Mode, so it has no signing secret and no Events API request URL. Don't set a `…_SLACK_SIGNING_SECRET`; the channel never reads one.

### Option A: Cursor-managed app (recommended)

```bash
npx agent-sdk login
npx agent-sdk slack create --dir . --env prod --prefix TSS_CASE_ANALYST --name "TSS Case Analyst"
```

The command opens **Add Slack to this agent** in the browser. Approve the Slack install there. Cursor creates the app with the scopes and events listed below, stores both tokens as deployment secrets, and redeploys the agent. It also writes the tokens to `.env.local`, which is gitignored. If your workspace needs admin approval, keep the command running, open the **Request approval** link it prints, and select **Retry** in the wizard after an admin approves. Leave out `--env prod` to create a separate dev app for `npx agent-sdk serve --dir . --dev`.

### Option B: Your own Slack app

1. Generate the manifest: `npx agent-sdk slack manifest --dir . --env prod --prefix TSS_CASE_ANALYST --name "TSS Case Analyst"`. At [api.slack.com/apps](https://api.slack.com/apps), choose **Create New App**, then **From a manifest**, and paste it. You can also set up the app by hand with these settings:
   - **Socket Mode:** on.
   - **Bot scopes:** `app_mentions:read`, `assistant:write`, `channels:history`, `channels:read`, `chat:write`, `files:read`, `files:write`, `groups:history`, `groups:read`, `im:history`, `im:read`, `im:write`, `mpim:history`, `reactions:read`, `reactions:write`, `usergroups:read`, `users:read`, `users:read.email`.
   - **Bot events:** `app_mention`, `message.im`, `message.channels`, `message.groups`, `reaction_added`, `app_home_opened`, `agent_session_stopped`.
   - **Interactivity:** on. Socket Mode doesn't need a request URL.
   - **App Home:** turn on the Messages tab so people can DM the bot.
2. Install the app to the workspace. Copy the bot token from **OAuth & Permissions**.
3. Under **Basic Information**, go to **App-Level Tokens** and create a token with the `connections:write` scope.
4. Set both secrets. Each command prompts for the value, which stays out of shell history: `npx agent-sdk secret set tss-case-analyst TSS_CASE_ANALYST_SLACK_BOT_TOKEN` and `npx agent-sdk secret set tss-case-analyst TSS_CASE_ANALYST_SLACK_APP_TOKEN`. To update a value that's already set, run `secret set` again.
5. Redeploy: `npx agent-sdk deploy`.

### Verify

1. Run `npx agent-sdk slack doctor --dir . --prefix TSS_CASE_ANALYST` with the tokens in `.env.local`. The `app_token`, `connections_open`, `bot_token`, and `auth_test` checks should pass.
2. In Slack, invite the bot to the channel with `/invite @TSS Case Analyst`, then @mention it or send it a DM. A threaded reply should appear.
3. If nothing arrives, check `npx agent-sdk logs --prod --slug tss-case-analyst` for `inbound kind=app_mention` and `reply delivered`.
