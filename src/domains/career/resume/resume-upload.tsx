"use client";

import { FileText, LoaderCircle, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/shared/ui/button";

export function ResumeUpload() {
  const [file, setFile] = useState<File>();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const router = useRouter();

  return (
    <form
      className="grid gap-5"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!file) return setError("Choose your PDF or DOCX resume.");
        setPending(true);
        setError(undefined);
        const formData = new FormData();
        formData.set("resume", file);
        const response = await fetch("/api/career/resume", { method: "POST", body: formData });
        const result = (await response.json()) as { error?: string };
        if (!response.ok) {
          setError(result.error ?? "The resume could not be processed.");
          setPending(false);
          return;
        }
        router.refresh();
      }}
    >
      <label className="grid min-h-56 cursor-pointer place-items-center rounded-3xl border-2 border-dashed border-[var(--line)] bg-white/40 p-8 text-center transition hover:border-[var(--focus)]">
        <input className="sr-only" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => setFile(event.target.files?.[0])} />
        <span>
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--lime)]"><Upload className="size-6" /></span>
          <span className="mt-5 block text-lg font-bold">{file ? file.name : "Choose your existing resume"}</span>
          <span className="mt-2 block text-sm text-[var(--muted)]">PDF or DOCX · 5 MB maximum · scanned PDFs need OCR</span>
        </span>
      </label>
      {file ? <div className="flex items-center gap-3 rounded-xl bg-white/60 p-3 text-sm"><FileText className="size-4" /><span className="min-w-0 flex-1 truncate font-semibold">{file.name}</span><span className="text-[var(--muted)]">{(file.size / 1024).toFixed(0)} KB</span></div> : null}
      {error ? <p role="alert" className="text-sm font-semibold text-red-700">{error}</p> : null}
      <Button type="submit" disabled={pending}>{pending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}Extract career information</Button>
      <p className="text-xs leading-5 text-[var(--muted)]">Extraction creates a pending draft. Nothing becomes a verified career fact until you review and approve it.</p>
    </form>
  );
}
