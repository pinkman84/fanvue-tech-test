import { useEffect, useRef, useState } from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { fetchMessages, postMessage, Message } from "@/api/client";

export function MessagePane({ threadId }: { threadId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [draft, setDraft] = useState<string>("")
  const [sendingMessage, setSendingMessage] = useState<boolean>(false)

  const virtuosoRef = useRef<VirtuosoHandle>(null);

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

  useEffect(() => {
    let alive = true;

    setMessages([]);
    setCursor(null);

    fetchMessages({threadId, direction: "backward", limit: 50}).then((page) => {
        if (!alive) return;
        setMessages(page.items);
        setCursor(page.nextCursor);
    });

    return () => {
        alive = false;
    };
  }, [threadId])

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

const sendNewMessage = async () => {
    const messageText = draft.trim();
    if (!messageText || sendingMessage) {
        return;
    }
    setSendingMessage(true);
    try {
        const created = await postMessage({ threadId, text: messageText });
        setMessages((prev) => [...prev, created]);
        setDraft("");
        setTimeout(() => virtuosoRef.current?.scrollToIndex({ index: messages.length, align: "end"}), 100)
    } finally {
        setSendingMessage(false)
    }
}


  return (
   <div style={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column"}}>
     <div style={{ flex: 1, minHeight: 0 }}>
      <Virtuoso
        ref={virtuosoRef}
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
    <div style={{ borderTop: "1 solid #eee", paddingTop: 8, marginTop: 8}}>
        <form onSubmit={(e) => {
            e.preventDefault();
            sendNewMessage();
        }}
        style={{ display: "flex", gap: 8 }}
        >   
            <input 
            value={draft} 
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Reply..."
            style={{ flex: 1, padding: 8}}
            />
        </form>
    </div>
   </div>
  );
}
