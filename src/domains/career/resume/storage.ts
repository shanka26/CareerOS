import "server-only";

import { createHash, randomUUID } from "node:crypto";
import { unlink } from "node:fs/promises";
import { del, put } from "@vercel/blob";

import type { ResumeFileKind } from "./file-policy";
import { storeResumeLocally } from "./local-storage";

const resumeContentTypes: Record<ResumeFileKind, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

function privateResumePath(userId: string, kind: ResumeFileKind) {
  const ownerKey = createHash("sha256").update(userId).digest("hex");
  return `resumes/${ownerKey}/${randomUUID()}.${kind}`;
}

export async function storeResume(userId: string, bytes: Uint8Array, kind: ResumeFileKind) {
  if (process.env.NODE_ENV === "production") {
    if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.VERCEL_OIDC_TOKEN) {
      throw new Error("Private resume storage is not configured.");
    }

    const blob = await put(privateResumePath(userId, kind), Buffer.from(bytes), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: false,
      contentType: resumeContentTypes[kind],
      multipart: false,
    });

    return {
      location: blob.url,
      provider: "vercel-blob" as const,
      remove: () => del(blob.url),
    };
  }

  const path = await storeResumeLocally(userId, bytes, kind);
  return {
    location: path,
    provider: "local" as const,
    remove: () => unlink(path),
  };
}
