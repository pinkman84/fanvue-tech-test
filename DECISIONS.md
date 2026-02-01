Handling large numbers of messages
---

To ensure the application behaved correctly under realistic load, I deliberately seeded the API with threads containing a large number of messages (20,000+ in this example). This allowed performance characteristics and scrolling behaviour to be validated early rather than optimised hypothetically.

On the frontend, the message list is virtualised using **react-virtuoso**, which is well suited to chat-style interfaces. Virtualisation ensures that only the visible subset of messages is rendered to the DOM at any given time, keeping the UI responsive even with very large datasets. No additional configuration was required to achieve acceptable performance at this scale.

An additional reason for choosing `react-virtuoso` was its built-in support for scroll anchoring. When older messages are prepended to the list, Virtuoso maintains the user’s viewport position automatically, which avoids the common “scroll jump” issues seen in naïve implementations.

---

Scroll anchoring and “new messages” behaviour
---

Scroll anchoring for loading older messages is handled by Virtuoso when additional pages are prepended to the message list. This allows users to scroll upwards naturally to load earlier history without disrupting their current position.

When a new message is created locally, the UI scrolls to the most recent message to provide a familiar chat-like experience.

Due to the timeboxed nature of the exercise, a full “new messages” indicator (for messages arriving while the user is scrolled away from the bottom) was not implemented. Given more time, I would approach this as follows:

- Track a `lastViewedAt` timestamp per thread.

- Compare this value against incoming messages’ `createdAt` timestamps.

- Derive a count of messages where `createdAt > lastViewedAt`.

- Use this count to display a small badge or indicator on the relevant thread in the thread list.

- When viewing a thread, only auto-scroll if the user is already at the bottom; otherwise, show a “New messages” affordance that scrolls on interaction.

This approach avoids disrupting the user while still making new activity visible.

---

Race conditions and request cancellation
---

To handle rapid thread switching and avoid race conditions, async effects that fetch messages are guarded using a simple “alive” flag pattern. This prevents late responses from updating state after a component has unmounted or the selected thread has changed.

This approach is intentionally lightweight and effective for a timeboxed exercise. However, it does not cancel the underlying network request; the request continues to completion and its result is simply ignored.

In a production setting, I would prefer to use **AbortController**, as it provides several advantages:

- **True request cancellation**: in-flight requests are actively aborted when dependencies change or components unmount.

- **Reduced unnecessary work**: aborting requests frees browser and network resources, which becomes important under rapid interactions such as fast thread switching.

- **Clearer ownership of request lifecycles**: cancellation is explicit rather than implicit.

- **Better composability**: `AbortController` integrates cleanly with `fetch` and with libraries such as React Query, allowing consistent cancellation behaviour across the application.

The current implementation was chosen to minimise boilerplate while still preventing stale state updates. The code structure allows an upgrade to `AbortController` without changing component responsibilities or data flow.

---

React state management and lifecycle hooks
---

The application uses a small set of React hooks intentionally and consistently:

- `useState` is used for local, stateful UI concerns such as:

    - selected thread

    - loaded messages and pagination cursor

    - draft message input

    - loading and sending flags

- **useEffect** is used sparingly and primarily to trigger side effects when key dependencies change, such as fetching messages when the selected thread changes. Guards are applied to prevent stale responses from updating state.

- **useRef** is used to hold an imperative reference to the virtualised message list. This enables controlled scrolling behaviour when a new message is sent, without introducing unnecessary state or re-renders.

- **useMemo** is used to cache derived data, such as filtered thread lists during search. This avoids unnecessary recomputation on each render and keeps UI updates predictable.

Overall, the goal was to keep state local, effects explicit, and derived data clearly separated from source state.

---

Missed functionality and future improvements
---

Some functionality was intentionally scoped out to focus on core interaction patterns:

## Server-sent events (SSE) / real-time updates

Real-time message updates were not implemented, as this was outside my prior hands-on experience and the primary goals of the exercise.

Given more time, I would implement this using Server-Sent Events by:

- Adding a streaming endpoint on the server (e.g. `/threads/:id/stream`)

- Keeping the connection open and pushing new messages as they are created

- Updating the UI in real time while respecting scroll position and “new messages” behaviour

To simulate activity across multiple threads, the server could periodically create messages on random threads during development.

---

Final note on scope
---

This solution was implemented as a timeboxed exercise. Design decisions prioritised correctness, performance at scale, and clear separation of concerns over feature completeness. The existing structure is intentionally flexible and designed to support incremental enhancement without major refactoring.