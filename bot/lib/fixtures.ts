import { demoRepo } from "./demo-repo.js";

export const STAND_IN_NOTICE =
  "Fictional stand-in data for a demo. Not a real customer, system or incident.";

export const SERVICE = "update-relay";

const repoUrl = `https://github.com/${demoRepo.owner}/${demoRepo.name}`;
const short = (sha: string) => sha.slice(0, 7);

export type SupportCase = {
  id: string;
  customer: string;
  priority: "P1" | "P2" | "P3";
  status: string;
  product: string;
  region: string;
  openedAt: string;
  closedAt?: string;
  contact: string;
  subject: string;
  description: string;
  affectedEndpoints?: number;
  tags: string[];
  rootCause?: string;
  resolution?: string;
};

export const cases: SupportCase[] = [
  {
    id: "TSS-48213",
    customer: "Northwind Logistics",
    priority: "P2",
    status: "Open. Assigned to TSS on-call.",
    product: "Endpoint Agent 9.4 (pattern updates delivered through update-relay)",
    region: "us-east-1",
    openedAt: "2026-11-04T15:42:00Z",
    contact: "Priya Raman, IT operations lead",
    subject: "US East endpoints can't download pattern updates",
    description:
      "Since about 9 AM Eastern, roughly 1,900 endpoints at our US East sites fail to download pattern update 26.311. The console shows \"Update failed: package not found (404)\". Our EU sites update normally. We haven't changed anything on our side. Our security team wants these endpoints current today. What's the ETA?",
    affectedEndpoints: 1912,
    tags: ["pattern-update", "download-failure", "404", "us-east-1"],
  },
  {
    id: "TSS-47102",
    customer: "Fabrikam Health",
    priority: "P2",
    status: "Closed",
    product: "Endpoint Agent 9.3 (pattern updates delivered through update-relay)",
    region: "eu-west-1",
    openedAt: "2026-09-15T08:20:00Z",
    closedAt: "2026-09-15T11:05:00Z",
    contact: "IT service desk",
    subject: "EU endpoints fail pattern download after origin migration",
    description:
      "Endpoints in our EU offices fail to download the latest pattern file with a 404 package-not-found error. Older endpoints that only need engine files update fine.",
    affectedEndpoints: 640,
    tags: ["pattern-update", "download-failure", "404", "eu-west-1", "origin"],
    rootCause:
      "eu-west-1 was routed to an origin pool whose package sync was paused during a migration. Requests for packages newer than the pool's last synced package returned 404 NoSuchKey.",
    resolution:
      "Routed eu-west-1 to an active, fully synced origin pool. Endpoints recovered within 20 minutes. Follow-up action: add a config check that rejects routing to an inactive origin. Status of the follow-up: not done.",
  },
  {
    id: "TSS-46550",
    customer: "Tailspin Retail",
    priority: "P3",
    status: "Closed",
    product: "Endpoint Agent 9.3",
    region: "ap-southeast-1",
    openedAt: "2026-08-02T03:10:00Z",
    closedAt: "2026-08-03T01:45:00Z",
    contact: "Network team",
    subject: "Pattern downloads are slow at two branch offices",
    description:
      "Pattern updates take over an hour at two branch offices. Downloads complete eventually. No errors.",
    affectedEndpoints: 85,
    tags: ["pattern-update", "slow-download", "proxy", "ap-southeast-1"],
    rootCause: "The customer's web proxy throttled large downloads at the two branches.",
    resolution: "Customer added the update hosts to the proxy bypass list.",
  },
];

export type Alarm = {
  id: string;
  service: string;
  region: string;
  state: "ALARM" | "OK";
  since: string;
  metric: string;
  threshold: string;
  current: string;
  series?: { at: string; errorRatePct: number }[];
  note?: string;
};

export const alarms: Alarm[] = [
  {
    id: "update-relay/us-east-1/upstream-errors",
    service: SERVICE,
    region: "us-east-1",
    state: "ALARM",
    since: "2026-11-04T14:06:00Z",
    metric: "upstream_error_rate: share of relay-to-origin package fetches that fail",
    threshold: "above 2% for 2 minutes",
    current: "38.4%",
    series: [
      { at: "2026-11-04T13:50:00Z", errorRatePct: 0.3 },
      { at: "2026-11-04T13:55:00Z", errorRatePct: 0.4 },
      { at: "2026-11-04T14:00:00Z", errorRatePct: 0.4 },
      { at: "2026-11-04T14:05:00Z", errorRatePct: 22.7 },
      { at: "2026-11-04T14:10:00Z", errorRatePct: 36.9 },
      { at: "2026-11-04T14:30:00Z", errorRatePct: 38.6 },
      { at: "2026-11-04T15:00:00Z", errorRatePct: 38.1 },
      { at: "2026-11-04T15:30:00Z", errorRatePct: 38.5 },
      { at: "2026-11-04T15:45:00Z", errorRatePct: 38.4 },
    ],
    note: "The failing fetches are HTTP 404 responses from the origin. Relay hosts are healthy: CPU, memory and relay-side 5xx are normal.",
  },
  {
    id: "update-relay/eu-west-1/upstream-errors",
    service: SERVICE,
    region: "eu-west-1",
    state: "OK",
    since: "2026-11-01T17:42:00Z",
    metric: "upstream_error_rate: share of relay-to-origin package fetches that fail",
    threshold: "above 2% for 2 minutes",
    current: "0.3%",
  },
  {
    id: "update-relay/ap-southeast-1/upstream-errors",
    service: SERVICE,
    region: "ap-southeast-1",
    state: "OK",
    since: "2026-10-20T16:30:00Z",
    metric: "upstream_error_rate: share of relay-to-origin package fetches that fail",
    threshold: "above 2% for 2 minutes",
    current: "0.2%",
  },
];

export type LogLine = {
  at: string;
  level: "INFO" | "WARN" | "ERROR" | "ALERT";
  region: string;
  message: string;
};

const bad = short(demoRepo.seededBugCommit);

export const logs: LogLine[] = [
  {
    at: "2026-11-04T14:01:02Z",
    level: "INFO",
    region: "us-east-1",
    message: `deploy started: config revision ${bad} (Move us-east-1 to origin pool A during pool C maintenance)`,
  },
  {
    at: "2026-11-04T14:04:10Z",
    level: "INFO",
    region: "us-east-1",
    message: `config reloaded: revision=${bad} origin=origin-pool-a (previous origin=origin-pool-c)`,
  },
  {
    at: "2026-11-04T14:04:12Z",
    level: "WARN",
    region: "us-east-1",
    message:
      "upstream fetch failed: package=pattern-26.311.zip origin=origin-pool-a.update-relay.example status=404 code=NoSuchKey",
  },
  {
    at: "2026-11-04T14:04:12Z",
    level: "WARN",
    region: "us-east-1",
    message: "client response: status=404 package=pattern-26.311.zip client=endpoint-agent/9.4.2",
  },
  {
    at: "2026-11-04T14:04:15Z",
    level: "INFO",
    region: "us-east-1",
    message:
      "upstream fetch ok: package=engine-9.4.2.cab origin=origin-pool-a.update-relay.example status=200",
  },
  {
    at: "2026-11-04T14:05:00Z",
    level: "INFO",
    region: "eu-west-1",
    message:
      "upstream fetch ok: package=pattern-26.311.zip origin=origin-pool-b.update-relay.example status=200",
  },
  {
    at: "2026-11-04T14:06:00Z",
    level: "ALERT",
    region: "us-east-1",
    message: "alarm update-relay/us-east-1/upstream-errors changed to ALARM (error rate 22.7%)",
  },
  {
    at: "2026-11-04T14:31:47Z",
    level: "WARN",
    region: "us-east-1",
    message:
      "upstream fetch failed: package=pattern-26.311-delta-26.309.zip origin=origin-pool-a.update-relay.example status=404 code=NoSuchKey",
  },
  {
    at: "2026-11-04T15:12:30Z",
    level: "INFO",
    region: "ap-southeast-1",
    message:
      "upstream fetch ok: package=pattern-26.311.zip origin=origin-pool-c.update-relay.example status=200",
  },
  {
    at: "2026-11-04T15:40:03Z",
    level: "WARN",
    region: "us-east-1",
    message:
      "upstream fetch failed: package=pattern-26.311.zip origin=origin-pool-a.update-relay.example status=404 code=NoSuchKey",
  },
];

export const logStats: Record<string, string> = {
  "us-east-1":
    "14:04Z to 15:45Z on Nov 4: 48,216 failed upstream fetches. All are HTTP 404 NoSuchKey from origin-pool-a, and all are for packages newer than 26.300. No failures for packages at or below 26.300.",
  "eu-west-1": "Nov 4: 0.3% failed upstream fetches, in line with the normal baseline.",
  "ap-southeast-1": "Nov 4: 0.2% failed upstream fetches, in line with the normal baseline.",
};

export type ConfigCommit = {
  sha: string;
  shortSha: string;
  url: string;
  author: string;
  date: string;
  subject: string;
  body: string;
  files: string[];
  diff: string;
  deployedToProduction?: string;
};

export const configHistory: ConfigCommit[] = [
  {
    sha: demoRepo.seededBugCommit,
    shortSha: bad,
    url: `${repoUrl}/commit/${demoRepo.seededBugCommit}`,
    author: "Dana Kim",
    date: "2026-11-04T13:58:00Z",
    subject: "Move us-east-1 to origin pool A during pool C maintenance",
    body: "Pool C has scheduled maintenance today. Serve us-east-1 from pool A until it finishes.",
    files: ["config/regions.json"],
    diff: [
      "--- a/config/regions.json",
      "+++ b/config/regions.json",
      "@@ -1,5 +1,5 @@",
      " {",
      '-  "us-east-1": { "origin": "origin-pool-c" },',
      '+  "us-east-1": { "origin": "origin-pool-a" },',
      '   "eu-west-1": { "origin": "origin-pool-b" },',
      '   "ap-southeast-1": { "origin": "origin-pool-c" }',
      " }",
    ].join("\n"),
    deployedToProduction: "2026-11-04T14:04:10Z",
  },
  {
    sha: demoRepo.retirePoolACommit,
    shortSha: short(demoRepo.retirePoolACommit),
    url: `${repoUrl}/commit/${demoRepo.retirePoolACommit}`,
    author: "Sam Okafor",
    date: "2026-11-01T17:30:00Z",
    subject: "Retire origin pool A and move eu-west-1 to pool B",
    body: "Pool A is decommissioned. Package sync stopped after 26.300.",
    files: ["config/origins.json", "config/regions.json"],
    diff: [
      "--- a/config/origins.json",
      "+++ b/config/origins.json",
      "@@ -1,7 +1,10 @@",
      " {",
      '   "origin-pool-a": {',
      '     "host": "origin-pool-a.update-relay.example",',
      '-    "status": "active"',
      '+    "status": "retired",',
      '+    "retiredOn": "2026-11-01",',
      '+    "lastPackage": "26.300",',
      '+    "note": "Decommissioned. Package sync stopped after 26.300."',
      "   },",
      '   "origin-pool-b": {',
      '     "host": "origin-pool-b.update-relay.example",',
      "--- a/config/regions.json",
      "+++ b/config/regions.json",
      "@@ -1,5 +1,5 @@",
      " {",
      '   "us-east-1": { "origin": "origin-pool-c" },',
      '-  "eu-west-1": { "origin": "origin-pool-a" },',
      '+  "eu-west-1": { "origin": "origin-pool-b" },',
      '   "ap-southeast-1": { "origin": "origin-pool-c" }',
      " }",
    ].join("\n"),
    deployedToProduction: "2026-11-01T17:41:00Z",
  },
  {
    sha: demoRepo.initialCommit,
    shortSha: short(demoRepo.initialCommit),
    url: `${repoUrl}/commit/${demoRepo.initialCommit}`,
    author: "Alex Rivera",
    date: "2026-10-20T16:00:00Z",
    subject: "Add update-relay service with region routing and config checks",
    body: "Routes endpoint-agent update downloads to an origin pool per region.",
    files: [
      "config/origins.json",
      "config/regions.json",
      "src/relay.js",
      "test/config.test.js",
      ".github/workflows/ci.yml",
      ".github/workflows/deploy.yml",
    ],
    diff: "Initial commit. us-east-1 and ap-southeast-1 use origin-pool-c, eu-west-1 uses origin-pool-a, and all three pools are active.",
    deployedToProduction: "2026-10-20T16:25:00Z",
  },
];

export const origins = {
  latestPublishedPackage: "26.311, published 2026-11-03T22:10:00Z",
  pools: [
    {
      name: "origin-pool-a",
      host: "origin-pool-a.update-relay.example",
      configStatus: "retired",
      retiredOn: "2026-11-01",
      latestPackage: "26.300",
      packageSync: "Stopped on 2026-11-01",
      servingRegions: ["us-east-1"],
    },
    {
      name: "origin-pool-b",
      host: "origin-pool-b.update-relay.example",
      configStatus: "active",
      latestPackage: "26.311",
      packageSync: "Current",
      capacityHeadroomPct: 55,
      servingRegions: ["eu-west-1"],
    },
    {
      name: "origin-pool-c",
      host: "origin-pool-c.update-relay.example",
      configStatus: "active",
      latestPackage: "26.311",
      packageSync: "Current",
      capacityHeadroomPct: 10,
      maintenance: "2026-11-04 14:00 to 18:00 UTC, reduced capacity",
      servingRegions: ["ap-southeast-1"],
    },
  ],
};

export const sources = {
  repo: repoUrl,
  regionsFile: `${repoUrl}/blob/main/config/regions.json`,
  originsFile: `${repoUrl}/blob/main/config/origins.json`,
};
