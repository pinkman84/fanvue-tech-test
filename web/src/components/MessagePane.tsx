"use client";

import { useEffect, useState } from "react";
import { fetchMessages, Message } from "@/api/client";

import { Virtuoso } from "react-virtuoso";


export function MessagePane({ threadId }: { threadId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);

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

  return (
  <div style={{ height: "100%", minHeight: 400 }}>
    <Virtuoso
      data={messages}
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
