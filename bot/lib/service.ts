import { SERVICE } from "./fixtures.js";

export function requireKnownService(service: string): string {
  const normalized = service.trim().toLowerCase().replace(/^tss-/, "");
  if (normalized !== SERVICE) {
    throw new Error(`No data for service "${service}". The stand-in data covers ${SERVICE} only.`);
  }
  return SERVICE;
}
