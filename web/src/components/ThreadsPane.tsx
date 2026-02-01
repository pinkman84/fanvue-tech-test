// web/src/components/ThreadsPane.tsx
"use client";

import { useMemo, useState } from "react";
import type { Thread } from "@/api/client";

export function ThreadsPane(props: {
  threads: Thread[];
  selectedThreadId: string | null;
  onSelect: (thread: Thread) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const searchQuery = query.trim().toLowerCase();
    if (!searchQuery) return props.threads;
    return props.threads.filter((t) => t.title.toLowerCase().includes(q));
  }, [props.threads, query]);

  return (
    <div style={{display: "flex", flexDirection: "column"}}>
      <input
        id="thread-search-input"
        aria-label="Search threads"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search threads…"
      />

      {filtered.length === 0 ? (
        <div>No threads match your search.</div>
      ) : (
        filtered.map((thread) => (
          <button
            key={thread.id}
            onClick={() => props.onSelect(thread)}
            aria-current={thread.id === props.selectedThreadId ? "true" : "false"}
            style={{padding: 8, textAlign: "left", cursor: "pointer"}}
          >
            {thread.title}
          </button>
        ))
      )}
    </div>
  );
}
