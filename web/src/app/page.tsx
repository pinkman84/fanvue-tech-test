"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchThreads, Thread } from "@/api/client";
import { MessagePane } from "@/components/MessagePane";

export default function Home() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filteredThreads = useMemo(() => {
  const q = query.trim().toLowerCase();
    if (!q) return threads;

    return threads.filter((t) => t.title.toLowerCase().includes(q));
  }, [threads, query]);

  useEffect(() => {
    fetchThreads().then((t) => {
      setThreads(t);
      if (t.length > 0) setSelectedThreadId(t[0].id);
    });
  }, []);

  return (
    <main style={{ display: "flex", height: "100vh" }}>
      <aside style={{ width: 300, borderRight: "1px solid #ddd" }}>
        <div style={{ padding: 12, borderBottom: "1px solid #ddd" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search threads…"
          style={{ width: "100%", padding: 8 }}
        />
        </div>

        {filteredThreads.length === 0 ? (
          <div style={{ padding: 12, color: "#666" }}>No threads match your search.</div>
        ) : (
          filteredThreads.map((t) => (
          <div
            key={t.id}
            onClick={() => setSelectedThreadId(t.id)}
            style={{
              padding: 12,
              cursor: "pointer",
              background:
                t.id === selectedThreadId ? "#f5f5f5" : "transparent",
            }}
          >
            {t.title}
          </div>
        ))
        )}
      </aside>

     <section style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", minHeight: 0 }}>
      {selectedThreadId ? (
      <div style={{ flex: 1, minHeight: 0 }}>
        <MessagePane threadId={selectedThreadId} />
      </div>
      ) : (
      <div>Select a thread</div>
  )}
</section>

    </main>
  );
}
