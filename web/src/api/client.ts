const API_BASE = "http://localhost:4000";

export type Thread = {
  id: string;
  title: string;
  lastMessageAt: number;
};

export type Message = {
  id: string;
  threadId: string;
  text: string;
  createdAt: number;
};

export async function fetchThreads(): Promise<Thread[]> {
  const res = await fetch(`${API_BASE}/threads`);
  if (!res.ok) throw new Error("Failed to fetch threads");
  const data = await res.json();
  return data.items;
}

export async function fetchMessages(opts: {
  threadId: string;
  cursor?: string | null;
  limit?: number;
  direction?: "forward" | "backward";
}): Promise<{ items: Message[]; nextCursor: string | null }> {
  const params = new URLSearchParams();
  if (opts.cursor) params.set("cursor", opts.cursor);
  if (opts.limit) params.set("limit", String(opts.limit));
  if (opts.direction) params.set("direction", opts.direction);

  const res = await fetch(
    `${API_BASE}/threads/${opts.threadId}/messages?${params.toString()}`
  );

  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}

export async function postMessage(opts: {
    threadId: string;
    text: string;
}): Promise<Message> {
    const res = await fetch(`${API_BASE}/threads/${opts.threadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: opts.text })
    });

    if (!res.ok) throw new Error("Failed to post message");
    return res.json();
}