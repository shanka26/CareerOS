"use client";

import { Send, Sparkles } from "lucide-react";
import { useState } from "react";

import type { JobSearchAssistantMessage, JobSearchAssistantResponse } from "./search-assistant-contract";
import { messageFromError, requestJson } from "@/shared/lib/api-client";
import { Button } from "@/shared/ui/button";

type SearchValues = JobSearchAssistantResponse["search"];

const welcome: JobSearchAssistantMessage = {
  role: "assistant",
  content: "Tell me what you want from your next role. I’ll turn your goals and verified profile into focused search keywords and filters.",
};

export function JobSearchAssistant({
  currentSearch,
  onApply,
}: {
  currentSearch: SearchValues;
  onApply: (search: SearchValues) => void;
}) {
  const [messages, setMessages] = useState<JobSearchAssistantMessage[]>([welcome]);
  const [draft, setDraft] = useState("");
  const [recommendation, setRecommendation] = useState<JobSearchAssistantResponse>();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function sendMessage() {
    const content = draft.trim();
    if (!content || pending) return;
    const nextMessages = [...messages, { role: "user", content } satisfies JobSearchAssistantMessage];
    setMessages(nextMessages);
    setDraft("");
    setPending(true);
    setError(undefined);
    try {
      const response = await requestJson<JobSearchAssistantResponse>("/api/jobs/search-assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.slice(-12), currentSearch }),
      }, "The AI job-search coach could not respond.");
      setMessages((current) => [...current, { role: "assistant", content: response.reply }]);
      setRecommendation(response);
    } catch (requestError) {
      setError(messageFromError(requestError, "The AI job-search coach could not respond."));
    } finally {
      setPending(false);
    }
  }

  return (
    <section aria-labelledby="job-search-coach-heading" className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--lime)]"><Sparkles className="size-5" /></div>
        <div>
          <h3 id="job-search-coach-heading" className="font-bold">AI search coach</h3>
          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">Chat about role, seniority, location, and priorities. You approve the exact search before it runs.</p>
        </div>
      </div>

      <div className="mt-4 max-h-64 space-y-2 overflow-y-auto" aria-live="polite">
        {messages.map((message, index) => (
          <p key={`${message.role}-${index}`} className={`max-w-[90%] rounded-xl px-3 py-2 text-sm leading-6 ${message.role === "user" ? "ml-auto bg-[var(--ink)] text-[var(--paper)]" : "bg-white text-[var(--ink)]"}`}>
            {message.content}
          </p>
        ))}
        {pending ? <p className="max-w-[90%] rounded-xl bg-white px-3 py-2 text-sm text-[var(--muted)]">Building a focused search…</p> : null}
      </div>

      <form className="mt-3 flex gap-2" onSubmit={(event) => { event.preventDefault(); void sendMessage(); }}>
        <label className="sr-only" htmlFor="job-search-coach-message">Message the job search coach</label>
        <input id="job-search-coach-message" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={1_200} placeholder="I want a senior remote role using TypeScript…" className="min-h-11 min-w-0 flex-1 rounded-xl border border-[var(--line)] bg-white px-3 text-sm" />
        <Button type="submit" size="small" disabled={pending || !draft.trim()}><Send className="mr-1 size-3" />Send</Button>
      </form>
      {error ? <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}

      {recommendation ? (
        <div className="mt-4 rounded-xl border border-[var(--line)] bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--accent)]">Recommended search</p>
          <p className="mt-2 font-bold">{recommendation.search.query}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">{recommendation.search.location || "Any location"} · {recommendation.search.remote === "remote" ? "Remote" : recommendation.search.remote === "onsite" ? "On-site / hybrid" : "Any workplace"}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{recommendation.rationale}</p>
          <Button type="button" size="small" className="mt-3" onClick={() => onApply(recommendation.search)}>
            <Sparkles className="mr-1 size-3" />{recommendation.readyToSearch ? "Use this search" : "Use current recommendation"}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
