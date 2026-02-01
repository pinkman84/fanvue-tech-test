"use client";

import { useEffect, useState } from "react";
import { fetchThreads, Thread } from "@/api/client";
import { MessagePane } from "@/components/MessagePane";

export default function Home() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  useEffect(() => {
    fetchThreads().then((t) => {
      setThreads(t);
      if (t.length > 0) setSelectedThreadId(t[0].id);
    });
  }, []);

  return (
    <main style={{ display: "flex", height: "100vh" }}>
      <aside style={{ width: 300, borderRight: "1px solid #ddd" }}>
        {threads.map((t) => (
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
        ))}
      </aside>

      <section style={{ flex: 1, padding: 16 }}>
       {selectedThreadId ? (
          <MessagePane threadId={selectedThreadId} />) 
          : (
              <div>Select a thread</div>
            )}

      </section>
    </main>
  );
}
