interface SourceVersion {
  version: number;
  knowledgeSnapshotId: string | null;
  aiProvider: string | null;
  aiModel: string | null;
  promptVersion: string | null;
}

export function buildUserEditedVersion(
  source: SourceVersion | undefined,
  markdown: string,
  explanation?: string,
) {
  return {
    version: (source?.version ?? 0) + 1,
    markdown,
    knowledgeSnapshotId: source?.knowledgeSnapshotId ?? null,
    aiProvider: source?.aiProvider ?? null,
    aiModel: source?.aiModel ?? null,
    promptVersion: source?.promptVersion ?? null,
    changeExplanation: {
      summary: explanation?.trim() || "User edited document content.",
      source: "user-edit",
      basedOnVersion: source?.version ?? null,
    },
  };
}
