"use client";

import { useEffect, useState } from "react";
import { fetchThreads, Thread } from "@/api/client";
import { ThreadsPane } from "@/components/ThreadsPane";
import { MessagePane } from "@/components/MessagePane";

export default function Home() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [selectedThreadName, setSelectedThreadName] = useState<string>("")
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [threadsError, setThreadsError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    setLoadingThreads(true);
    setThreadsError(null);

    fetchThreads()
      .then((items) => {
        if (!alive) return;
        setThreads(items);
        setSelectedThreadId((prev) => prev ?? (items[0]?.id ?? null));
      })
      .catch((e) => {
        if (!alive) return;
        setThreadsError(e instanceof Error ? e.message : "Failed to load threads");
      })
      .finally(() => {
        if (!alive) return;
        setLoadingThreads(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  return (
    <main style={{ display: "flex", height: "100vh" }}>
      <aside style={{ width: 320, borderRight: "1px solid #ddd", padding: 12 }}>
        <h1 style={{ margin: "0 0 12px 0" }}>Threads</h1>

        {loadingThreads && <div>Loading…</div>}
        {threadsError && <div style={{ color: "crimson" }}>{threadsError}</div>}

        {!loadingThreads && !threadsError && (
          <ThreadsPane
            threads={threads}
            selectedThreadId={selectedThreadId}
            onSelect={(thread) =>{
              setSelectedThreadId(thread.id);
              setSelectedThreadName(thread.title)
            }}
          />
        )}
      </aside>

      <section
        style={{
          flex: 1,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        {selectedThreadId ? (
          <div style={{ flex: 1, minHeight: 0 }}>
            <MessagePane threadId={selectedThreadId} threadName={selectedThreadName} />
          </div>
        ) : (
          <div>Select a thread</div>
        )}
      </section>
    </main>
  );
}
