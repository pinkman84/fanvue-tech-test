import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MessagePane } from "./MessagePane";

vi.mock("@/api/client", () => {
  return {
    fetchMessages: vi.fn(async () => ({
      items: [
        { id: "m1", threadId: "t1", text: "Hello", createdAt: 1 },
      ],
      nextCursor: null,
    })),
    postMessage: vi.fn(async () => ({
      id: "m2",
      threadId: "t1",
      text: "New message",
      createdAt: 2,
    })),
  };
});

vi.mock("react-virtuoso", () => {
  return {
    Virtuoso: ({ data, itemContent }: any) => (
      <div data-testid="virtuoso">
        {data.map((item: any, index: number) => (
          <div key={item.id ?? index}>{itemContent(index, item)}</div>
        ))}
      </div>
    ),
  };
});


test("sending a message appends it and clears the input", async () => {
  const user = userEvent.setup();
  render(<MessagePane threadId="t1" threadName="Test thread 1" />);

  // initial message appears
  expect(await screen.findByText("Hello")).toBeInTheDocument();

  const input = screen.getByPlaceholderText(/reply/i);
  await user.type(input, "New message");
  await user.click(screen.getByRole("button", { name: /send/i }));

  // message appears
  expect(await screen.findByText("New message")).toBeInTheDocument();

  // input cleared
  await waitFor(() => expect(input).toHaveValue(""));
});
