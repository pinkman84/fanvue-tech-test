// api/src/server.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { seedStore, listThreads, paginateMessages, getThread, createMessage } from "./store";

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

const app = express();

// ---- Middleware ----
app.use(cors()); // for local dev; you can restrict origin later
app.use(express.json());

// Simple request logger
app.use((req: Request, res: Response, next: NextFunction) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    const ms = Date.now() - startedAt;
    // Example: GET /threads 200 12ms
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
  });

  next();
});

// ---- Routes ----
app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

// TODO: Mount feature routers here (threads/messages/etc)
// app.use("/threads", threadsRouter);
app.get("/threads", (_req, res) => {
  const threads = listThreads();
  res.json({ items: threads });
});

app.get("/threads/:id/messages", (req, res) => {
  const threadId = req.params.id;

  const thread = getThread(threadId);
  if (!thread) {
    res.status(404).json({ error: "Thread not found" });
    return;
  }

  const limitRaw = req.query.limit;
  const limit = typeof limitRaw === "string" ? Number(limitRaw) : 50;

  const cursorRaw = req.query.cursor;
  const cursor = typeof cursorRaw === "string" ? cursorRaw : null;

  const dirRaw = req.query.direction;
  const direction =
    dirRaw === "forward" || dirRaw === "backward" ? dirRaw : "backward";

  const page = paginateMessages({ threadId, limit, cursor, direction });

  res.json(page);
});

app.post("/threads/:id/messages", (req, res) => {
    const threadId = req.params.id;
    const text = typeof req.body?.text === "string" ? req.body.text : "";

    if (!text.trim()) {
        res.status(400).json({ error: "text is required"});
        return;
    }

    try {
        const msg = createMessage({threadId, text});
        res.status(201).json(msg);
    } catch (e) {
        res.status(404).json({ error: "Thread not found" })
    }

});


// ---- Error handling ----
// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

// Central error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

seedStore();
console.log("Seeded store");
console.log(listThreads().slice(0, 3));
// ---- Start ----
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
