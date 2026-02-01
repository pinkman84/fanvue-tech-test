import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThreadsPane } from "./ThreadsPane";

const threads = [
  { id: "t1", title: "Big Thread (20k messages)", lastMessageAt: 1 },
  { id: "t2", title: "Random Chat", lastMessageAt: 2 },
];

test("filters threads by title", async () => {
  const user = userEvent.setup();

  render(
    <ThreadsPane
      threads={threads}
      selectedThreadId={null}
      onSelect={() => {}}
    />
  );

  // initial: both present
  expect(screen.getByText(/Big Thread/i)).toBeInTheDocument();
  expect(screen.getByText(/Random Chat/i)).toBeInTheDocument();

  // filter
  await user.type(screen.getByLabelText(/search threads/i), "big");

  expect(screen.getByText(/Big Thread/i)).toBeInTheDocument();
  expect(screen.queryByText(/Random Chat/i)).not.toBeInTheDocument();
});

test("shows empty state when no matches", async () => {
  const user = userEvent.setup();

  render(
    <ThreadsPane
      threads={threads}
      selectedThreadId={null}
      onSelect={() => {}}
    />
  );

  await user.type(screen.getByLabelText(/search threads/i), "zzz");
  expect(screen.getByText(/No threads match/i)).toBeInTheDocument();
});
