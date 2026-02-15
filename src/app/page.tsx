"use client";

import { FormEvent, useCallback, useState } from "react";
import type { ConversationMessage } from "@/lib/generator";

export default function Home() {
  const [topic, setTopic] = useState("How should society steer frontier AI?");
  const [turns, setTurns] = useState(8);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSimulation = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/simulate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ topic, turns })
        });

        if (!response.ok) {
          throw new Error("Could not run the simulation. Try again.");
        }

        const data = await response.json();
        setMessages(data.messages ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error");
      } finally {
        setLoading(false);
      }
    },
    [topic, turns]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="space-y-3 border-b border-white/10 pb-8">
          <p className="text-sm uppercase tracking-[0.4em] text-sky-300">
            Multi-Agent Playground
          </p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">
            Watch two custom agents debate any AI topic in seconds.
          </h1>
          <p className="max-w-3xl text-base text-slate-300">
            Nova (optimistic futurist) and Quill (grounded systems thinker) take
            turns reacting to your prompt. No external APIs required—the replies
            come from handcrafted personas, so you can fork this repo and swap in
            real LLM calls when you’re ready.
          </p>
        </header>

        <form onSubmit={runSimulation} className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <label className="space-y-2">
            <span className="text-sm font-semibold uppercase tracking-widest text-slate-200">
              Conversation topic
            </span>
            <input
              type="text"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-base text-white outline-none transition focus:border-sky-300"
              placeholder="e.g. Should local governments run open-source AI?"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold uppercase tracking-widest text-slate-200">
              Number of turns (4–20)
            </span>
            <input
              type="number"
              min={4}
              max={20}
              value={turns}
              onChange={(event) => setTurns(Number(event.target.value))}
              className="w-32 rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-base text-white outline-none transition focus:border-sky-300"
            />
          </label>

          {error && (
            <p className="rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-2 text-sm text-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-xl bg-sky-400 px-5 py-3 text-base font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-wait disabled:bg-sky-700/50"
          >
            {loading ? "Simulating…" : "Run conversation"}
          </button>
        </form>

        <section className="mt-10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Live transcript</h2>
            <p className="text-sm text-slate-400">
              {messages.length > 0 ? `${messages.length} messages generated` : "No conversation yet"}
            </p>
          </div>

          <div className="space-y-4 rounded-2xl border border-white/5 bg-gradient-to-b from-slate-900 to-slate-950 p-4">
            {messages.length === 0 ? (
              <p className="text-sm text-slate-400">
                Start a run to see Nova and Quill trade perspectives on your topic.
              </p>
            ) : (
              messages.map((message) => (
                <article
                  key={message.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
                    <span>{message.author.name} — {message.author.role}</span>
                    <time dateTime={message.timestamp}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </time>
                  </div>
                  <p className="mt-3 text-base leading-relaxed text-slate-100">
                    {message.content}
                  </p>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
