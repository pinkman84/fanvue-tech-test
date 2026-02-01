"use client";

import { useEffect, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import { fetchMessages, Message } from "@/api/client";

export function MessagePane({ threadId }: { threadId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingOlder, setLoadingOlder] = useState(false);

  // 1️⃣ initial load when thread changes
  useEffect(() => {
    setMessages([]);
    setCursor(null);

    fetchMessages({
      threadId,
      direction: "backward",
      limit: 50,
    }).then((page) => {
      setMessages(page.items);
      setCursor(page.nextCursor);
    });
  }, [threadId]);

  const loadOlder = async () => {
  if (!cursor || loadingOlder) return;

  setLoadingOlder(true);
  try {
    const page = await fetchMessages({
      threadId,
      cursor,
      direction: "backward",
      limit: 50,
    });

    setMessages((prev) => [...page.items, ...prev]);
    setCursor(page.nextCursor);
  } finally {
    setLoadingOlder(false);
  }
};


  return (
    <div style={{ height: "100%", minHeight: 0 }}>
      <Virtuoso
        data={messages}
        atTopStateChange={(atTop) => {
    if (atTop) loadOlder();
  }}
        itemContent={(_, m) => (
          <div style={{ padding: "8px 0" }}>
            <div style={{ fontSize: 12, color: "#666" }}>
              {new Date(m.createdAt).toLocaleTimeString()}
            </div>
            <div>{m.text}</div>
          </div>
        )}
      />
    </div>
  );
}
