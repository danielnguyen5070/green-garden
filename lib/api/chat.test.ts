import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createToolMarkupFilter,
  streamChat,
  stripToolMarkup,
  toChatApiMessages,
} from "@/lib/api/chat";

const LEAKED_DSML =
  '<｜｜DSML｜｜ calls> <｜｜DSML｜｜ invoke name="search_shop_faq"> ' +
  '<｜｜DSML｜｜ parameter name="locale" string="true">vi</｜｜DSML｜｜ parameter> ' +
  '<｜｜DSML｜｜ parameter name="query" string="true">thanh toán COD</｜｜DSML｜｜ parameter> ' +
  "</｜｜DSML｜｜ invoke> </｜｜DSML｜｜ calls>";

function frame(payload: unknown): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

function sseResponse(reads: string[]): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const read of reads) controller.enqueue(encoder.encode(read));
      controller.close();
    },
  });
  return new Response(body, {
    status: 200,
    headers: { "content-type": "text/event-stream" },
  });
}

async function runStream(reads: string[]) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(sseResponse(reads)));
  const tokens: string[] = [];
  const onDone = vi.fn();
  const onError = vi.fn();
  await streamChat(
    { message: "COD?", conversation: [] },
    { handlers: { onToken: (t) => tokens.push(t), onDone, onError } }
  );
  return { text: tokens.join(""), tokens, onDone, onError };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("createToolMarkupFilter", () => {
  it("drops markup split across tokens and keeps preceding text", () => {
    const filter = createToolMarkupFilter();
    const out = ["Dạ ", "<｜", LEAKED_DSML.slice(2, 30), LEAKED_DSML.slice(30), "more"]
      .map((t) => filter.push(t))
      .join("");
    expect(out + filter.flush()).toBe("Dạ ");
  });

  it("passes harmless angle brackets through", () => {
    const filter = createToolMarkupFilter();
    const tokens = ["Giá ", "<", "200k, ship ", "<3 ngày. a <", "b <"];
    const out = tokens.map((t) => filter.push(t)).join("") + filter.flush();
    expect(out).toBe(tokens.join(""));
  });
});

describe("streamChat", () => {
  it("streams chunks across split reads and finishes with onDone", async () => {
    const full = frame({ type: "chunk", content: "Xin " }) +
      frame({ type: "chunk", content: "chào!" }) +
      frame({ type: "done" });
    const { tokens, onDone, onError } = await runStream([
      full.slice(0, 17),
      full.slice(17, 50),
      full.slice(50),
    ]);
    expect(tokens.join("")).toBe("Xin chào!");
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it("never forwards DSML tool-call markup to onToken", async () => {
    const { text, onDone } = await runStream([
      frame({ type: "chunk", content: "Dạ " }),
      frame({ type: "chunk", content: "<｜" }),
      frame({ type: "chunk", content: LEAKED_DSML.slice(2) }),
      frame({ type: "done" }),
    ]);
    expect(text).toBe("Dạ ");
    expect(text).not.toContain("DSML");
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("calls onError and ignores events after an error", async () => {
    const { text, onDone, onError } = await runStream([
      frame({ type: "chunk", content: "Dạ " }),
      frame({ type: "error", message: "Chat request failed" }),
      frame({ type: "chunk", content: "ignored" }),
      frame({ type: "done" }),
    ]);
    expect(text).toBe("Dạ ");
    expect(onError).toHaveBeenCalledWith("Chat request failed");
    expect(onDone).not.toHaveBeenCalled();
  });

  it("treats a stream closed without a terminal event as done", async () => {
    const { text, onDone } = await runStream([frame({ type: "chunk", content: "Ok" })]);
    expect(text).toBe("Ok");
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});

describe("toChatApiMessages", () => {
  it("strips markup from assistant history and drops empty turns", () => {
    expect(
      toChatApiMessages([
        { role: "user", content: "Có COD không?" },
        { role: "assistant", content: LEAKED_DSML },
        { role: "assistant", content: `Dạ có. ${LEAKED_DSML}` },
      ])
    ).toEqual([
      { role: "user", content: "Có COD không?" },
      { role: "assistant", content: "Dạ có." },
    ]);
  });

  it("stripToolMarkup leaves plain text untouched", () => {
    expect(stripToolMarkup("Giá < 200k")).toBe("Giá < 200k");
  });
});
