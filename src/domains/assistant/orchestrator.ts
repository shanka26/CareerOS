import "server-only";
import type { z } from "zod";
import { prisma } from "@/shared/db/prisma";
import { promptVersions } from "./capabilities";
import type { AIProvider, AIRequest } from "./provider";

export async function runCapability<TSchema extends z.ZodType>(userId: string, provider: AIProvider, request: AIRequest<TSchema>, snapshotId?: string) {
  try {
    const result = await provider.generate(request);
    await prisma.generationLog.create({ data: { userId, provider: result.provider, model: result.model, action: request.capability, promptVersion: promptVersions[request.capability], inputSnapshotId: snapshotId ?? null, durationMs: result.durationMs, success: true } });
    return result;
  } catch (error) {
    await prisma.generationLog.create({ data: { userId, provider: "unknown", model: "unknown", action: request.capability, promptVersion: promptVersions[request.capability], inputSnapshotId: snapshotId ?? null, durationMs: 0, success: false, errorCode: error instanceof Error ? error.name : "UnknownError" } }).catch(() => undefined);
    throw error;
  }
}
