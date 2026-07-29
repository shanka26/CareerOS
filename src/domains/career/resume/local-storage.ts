import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve, sep } from "node:path";
import { randomUUID } from "node:crypto";

import type { ResumeFileKind } from "./file-policy";

export async function storeResumeLocally(userId: string, bytes: Uint8Array, kind: ResumeFileKind) {
  if (process.env.NODE_ENV === "production") throw new Error("Local resume storage is disabled in production. Configure the production object-storage adapter before accepting uploads.");
  const root = join(/* turbopackIgnore: true */ process.cwd(), ".data", "uploads");
  const directory = resolve(root, userId);
  if (!directory.startsWith(`${root}${sep}`)) throw new Error("Invalid storage path.");
  await mkdir(directory, { recursive: true });
  const path = resolve(directory, `${randomUUID()}.${kind}`);
  if (!path.startsWith(`${directory}${sep}`)) throw new Error("Invalid resume path.");
  await writeFile(path, bytes, { flag: "wx" });
  return path;
}
