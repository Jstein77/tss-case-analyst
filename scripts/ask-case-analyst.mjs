#!/usr/bin/env node
// Calls the TSS Case Analyst over its MCP endpoint (JSON-RPC over HTTP).
//
//   node ask-case-analyst.mjs "Analyze case TSS-48213."
//   node ask-case-analyst.mjs --session ses_123 "Shorten the draft reply."
//   node ask-case-analyst.mjs --tool get_case '{"caseId":"TSS-48213"}'
//
// Environment:
//   CASE_ANALYST_URL           Agent base URL: the hosted alias URL, or http://127.0.0.1:3100 locally.
//   CASE_ANALYST_ALIAS_TOKEN   Hosted deployments. Sent as X-Agent-Alias-Token.
//   CASE_ANALYST_BEARER_TOKEN  Self-hosted `agent-sdk serve --bearer-token`. Sent as Authorization: Bearer.
//
// Prints the agent's reply on stdout and the session ID on stderr. Never prints tokens.

const MAX_WAIT_MS = 10 * 60 * 1000;

function usage(message) {
  if (message) console.error(`error: ${message}`);
  console.error('usage: ask-case-analyst.mjs [--session <id>] "<message>"');
  console.error("       ask-case-analyst.mjs --tool <toolName> '<json input>'");
  process.exit(2);
}

function parseArgs(argv) {
  const args = { session: undefined, tool: undefined, rest: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--session") args.session = argv[++i];
    else if (arg === "--tool") args.tool = argv[++i];
    else if (arg === "-h" || arg === "--help") usage();
    else args.rest.push(arg);
  }
  return args;
}

function endpoint() {
  const base = process.env.CASE_ANALYST_URL;
  if (!base) usage("set CASE_ANALYST_URL");
  return `${base.replace(/\/+$/, "")}/v1/mcp`;
}

function authHeaders() {
  if (process.env.CASE_ANALYST_ALIAS_TOKEN) {
    return { "X-Agent-Alias-Token": process.env.CASE_ANALYST_ALIAS_TOKEN };
  }
  if (process.env.CASE_ANALYST_BEARER_TOKEN) {
    return { Authorization: `Bearer ${process.env.CASE_ANALYST_BEARER_TOKEN}` };
  }
  usage("set CASE_ANALYST_ALIAS_TOKEN (hosted) or CASE_ANALYST_BEARER_TOKEN (self-hosted)");
}

let nextId = 1;

async function callTool(name, args) {
  const response = await fetch(endpoint(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      ...authHeaders(),
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: nextId++, method: "tools/call", params: { name, arguments: args } }),
    signal: AbortSignal.timeout(70_000),
  });
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from the Case Analyst: ${body.slice(0, 300)}`);
  }
  const json = response.headers.get("content-type")?.includes("text/event-stream")
    ? JSON.parse(body.split("\n").filter((l) => l.startsWith("data:")).pop().slice(5))
    : JSON.parse(body);
  if (json.error) {
    throw new Error(`MCP error ${json.error.code}: ${json.error.message}`);
  }
  const text = json.result?.content?.find((part) => part.type === "text")?.text ?? "";
  return { isError: json.result?.isError === true, text };
}

async function ask(message, sessionId) {
  const started = Date.now();
  let result = await callTool("ask", { message, waitSeconds: 50, ...(sessionId ? { sessionId } : {}) });
  for (;;) {
    let payload;
    try {
      payload = JSON.parse(result.text);
    } catch {
      throw new Error(`Unexpected reply from the Case Analyst: ${result.text.slice(0, 300)}`);
    }
    if (payload.sessionId) console.error(`session: ${payload.sessionId}`);
    if (payload.status === "running") {
      if (Date.now() - started > MAX_WAIT_MS) throw new Error("The Case Analyst is still working after 10 minutes.");
      result = await callTool("check", { sessionId: payload.sessionId, waitSeconds: 50 });
      continue;
    }
    if (payload.status === "error" || result.isError) {
      throw new Error(payload.errorMessage ?? payload.reply ?? "The Case Analyst returned an error.");
    }
    return payload.reply ?? "";
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.tool) {
    let input = {};
    if (args.rest[0]) {
      try {
        input = JSON.parse(args.rest[0]);
      } catch {
        usage("tool input must be JSON");
      }
    }
    const result = await callTool("call_tool", { toolName: args.tool, input });
    console.log(result.text);
    process.exitCode = result.isError ? 1 : 0;
    return;
  }
  const message = args.rest.join(" ").trim();
  if (!message) usage("missing message");
  console.log(await ask(message, args.session));
}

main().catch((error) => {
  console.error(`error: ${error.message}`);
  process.exit(1);
});
