import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

function isPrivate(address: string) {
  if (address === "::1" || address.startsWith("fe80:") || address.startsWith("fc") || address.startsWith("fd")) return true;
  const parts = address.split(".").map(Number);
  if (parts.length !== 4) return false;
  return parts[0] === 10 || parts[0] === 127 || (parts[0] === 169 && parts[1] === 254) || (parts[0] === 172 && (parts[1] ?? 0) >= 16 && (parts[1] ?? 0) <= 31) || (parts[0] === 192 && parts[1] === 168) || parts[0] === 0;
}

export async function assertPublicJobUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || url.port) throw new Error("Job URLs must use public HTTPS without credentials or custom ports.");
  // Node exposes IPv6 URL hostnames with brackets on some platforms. DNS lookup
  // treats that form as a hostname, so normalize it before classifying the IP.
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  const addresses = isIP(hostname) ? [{ address: hostname }] : await lookup(hostname, { all: true });
  if (!addresses.length || addresses.some(({ address }) => isPrivate(address))) throw new Error("Private or local job URLs are not allowed.");
  return url;
}

export async function fetchPublicJobText(value: string) {
  let url = await assertPublicJobUrl(value);
  for (let redirect = 0; redirect <= 3; redirect += 1) {
    const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(8_000), headers: { "user-agent": "CareerOS Job Importer/1.0" } });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location"); if (!location) throw new Error("Invalid job URL redirect.");
      url = await assertPublicJobUrl(new URL(location, url).toString()); continue;
    }
    if (!response.ok) throw new Error(`Job page returned HTTP ${response.status}.`);
    if (!(response.headers.get("content-type") ?? "").includes("text/html")) throw new Error("Job URL must return HTML.");
    const declaredSize = Number(response.headers.get("content-length"));
    if (Number.isFinite(declaredSize) && declaredSize > 1_000_000) throw new Error("Job page is too large to import safely.");
    if (!response.body) throw new Error("Job page returned an empty body.");
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;
    while (true) {
      const { done, value: chunk } = await reader.read();
      if (done) break;
      received += chunk.byteLength;
      if (received > 1_000_000) { await reader.cancel(); throw new Error("Job page is too large to import safely."); }
      chunks.push(chunk);
    }
    const bytes = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    const html = new TextDecoder().decode(bytes);
    return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  }
  throw new Error("Job URL redirected too many times.");
}
