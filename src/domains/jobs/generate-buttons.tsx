"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { messageFromError, requestJson } from "@/shared/lib/api-client";

export function GenerateButtons({ jobId, cover = false }: { jobId: string; cover?: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const router = useRouter();

  return (
    <div>
      <Button disabled={pending} onClick={async () => {
        setPending(true);
        setError(undefined);
        const kind = cover ? "cover-letter" : "resume";
        try {
          const result = await requestJson<{ documentId?: string }>(
            `/api/jobs/${jobId}/generate-${kind}`,
            { method: "POST" },
            "Document generation failed.",
          );
          if (!result.documentId) throw new Error("Document generation returned an incomplete response.");
          router.push(`/dashboard/documents/${result.documentId}`);
        } catch (requestError) {
          setError(messageFromError(requestError, "Document generation failed."));
        } finally {
          setPending(false);
        }
      }}>
        {pending ? "Generating..." : cover ? "Compose cover letter" : "Compose verified resume"}
      </Button>
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
