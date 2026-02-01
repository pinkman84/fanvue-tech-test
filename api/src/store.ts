// api/src/store.ts

export type Thread = {
  id: string;
  title: string;
  lastMessageAt: number; // epoch ms
  unreadMessages: number;
};

export type Message = {
  id: string;
  threadId: string;
  text: string;
  createdAt: number; // epoch ms
};

// Cursor pagination contract
export type Page<T> = {
  items: T[];
  nextCursor: string | null;
};

// In-memory store shape
export type Store = {
  threadsById: Map<string, Thread>;
  messagesByThreadId: Map<string, Message[]>; // sorted by createdAt ASC
};

// Singleton store instance (simple take-home style)
export const store: Store = {
  threadsById: new Map(),
  messagesByThreadId: new Map(),
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Seed the in-memory store with predictable data.
 * Call this once at server startup.
 */
export function seedStore(opts?: {
  threadCount?: number;
  bigThreadMessageCount?: number;
  smallThreadMessageCountRange?: [number, number];
}): void {
  const threadCount = opts?.threadCount ?? 20;
  const bigThreadMessageCount = opts?.bigThreadMessageCount ?? 20000;
  const [minSmall, maxSmall] = opts?.smallThreadMessageCountRange ?? [10, 50];

  // Reset store
  store.threadsById.clear();
  store.messagesByThreadId.clear();

  const now = Date.now();

  for (let i = 0; i < threadCount; i++) {
    const threadId = makeId("thread");

    const isBigThread = i === 0;
    const messageCount = isBigThread
      ? bigThreadMessageCount
      : randomInt(minSmall, maxSmall);

    const messages: Message[] = [];

    for (let m = 0; m < messageCount; m++) {
      const createdAt =
        now - (messageCount - m) * 1000; // 1 second apart, oldest → newest

      messages.push({
        id: makeId("msg"),
        threadId,
        text: `Message ${m + 1} in ${isBigThread ? "big" : "small"} thread`,
        createdAt,
      });
    }

    const lastMessageAt =
      messages.length > 0 ? messages[messages.length - 1].createdAt : now;

    const thread: Thread = {
      id: threadId,
      title: isBigThread ? "Big Thread (20k messages)" : `Thread ${i + 1}`,
      lastMessageAt,
      unreadMessages: 0
    };

    // Store both sides
    store.threadsById.set(threadId, thread);
    store.messagesByThreadId.set(threadId, messages);
  }
  console.log(
  "Threads:",
  store.threadsById.size,
  "Messages in big thread:",
  Math.max(...Array.from(store.messagesByThreadId.values()).map(m => m.length))
);

}

/** Convenience: list threads sorted by lastMessageAt desc (inbox style). */
export function listThreads(): Thread[] {
  return Array.from(store.threadsById.values()).sort((a, b) => {
    // newest first
    if (b.lastMessageAt !== a.lastMessageAt) {
      return b.lastMessageAt - a.lastMessageAt;
    }
    // stable tie-breaker
    return a.id.localeCompare(b.id);
  });
}


export function getThread(threadId: string): Thread | undefined {
  return store.threadsById.get(threadId);
}

/** Get messages array reference for a thread (always returns an array). */
export function getMessages(threadId: string): Message[] {
  return store.messagesByThreadId.get(threadId) ?? [];
}

/**
 * Cursor helpers.
 * For take-home simplicity, keep cursor opaque but deterministic.
 * Example: `${createdAt}:${id}`
 */
export function encodeCursor(msg: Message): string {
  // TODO
  return `${msg.createdAt}:${msg.id}`;
}

export function decodeCursor(cursor: string): { createdAt: number; id: string } | null {
  const [createdAtRaw, id] = cursor.split(":");
  const createdAt = Number(createdAtRaw);

  if (!Number.isFinite(createdAt) || !id) return null;
  return { createdAt, id };
}

function cursorMatches(msg: Message, cur: { createdAt: number; id: string }): boolean {
  return msg.createdAt === cur.createdAt && msg.id === cur.id;
}

export function paginateMessages(opts: {
  threadId: string;
  limit: number;
  cursor?: string | null;
  direction: "forward" | "backward";
}): Page<Message> {
  const { threadId, limit, cursor, direction } = opts;

  const all = getMessages(threadId);
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 200) : 50;

  if (all.length === 0) return { items: [], nextCursor: null };

  const decoded = cursor ? decodeCursor(cursor) : null;

  // Find the index of the cursor item (naive O(n)).
  // If cursor is missing/invalid/not found, we treat it as "no cursor".
  let cursorIndex = -1;
  if (decoded) {
    cursorIndex = all.findIndex((m) => cursorMatches(m, decoded));
  }

  // We will always return items in ASC order.
  if (direction === "forward") {
    // forward means "newer"
    // If cursorIndex is -1, start at 0 (oldest).
    const start = cursorIndex >= 0 ? cursorIndex + 1 : 0;
    const end = Math.min(start + safeLimit, all.length);

    const items = all.slice(start, end);
    const nextCursor =
      end < all.length && items.length > 0 ? encodeCursor(items[items.length - 1]) : null;

    return { items, nextCursor };
  }

  // backward means "older"
  // If cursorIndex is -1, we start from the end (newest page).
  const endExclusive = cursorIndex >= 0 ? cursorIndex : all.length;
  const start = Math.max(0, endExclusive - safeLimit);

  const items = all.slice(start, endExclusive); // already ASC
  const nextCursor =
    start > 0 && items.length > 0 ? encodeCursor(items[0]) : null; // cursor points to oldest in this page

  return { items, nextCursor };
}


/** Create a new message and update thread lastMessageAt. */
export function createMessage(opts: { threadId: string; text: string }): Message {
  // TODO: validate thread exists
  // TODO: push into messages array
  // TODO: keep array sorted (or append if you always create "now")
  // TODO: update lastMessageAt
  // TODO: return created message
  throw new Error("Not implemented");
}

/** Update message text (return updated or undefined if not found). */
export function updateMessage(opts: {
  threadId: string;
  messageId: string;
  text: string;
}): Message | undefined {
  // TODO
  return undefined;
}

/** Delete message (return true if deleted, false otherwise). */
export function deleteMessage(opts: { threadId: string; messageId: string }): boolean {
  // TODO
  return false;
}

/** Tiny util for IDs. You can swap for crypto.randomUUID if you want. */
export function makeId(prefix = ""): string {
  // Prefer crypto.randomUUID when available (Node 18+)
  // return prefix ? `${prefix}_${crypto.randomUUID()}` : crypto.randomUUID();
  return prefix
    ? `${prefix}_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`
    : `${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
}
