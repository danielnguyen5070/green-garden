"use client";

import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { cn } from "@/lib/utils";

/** Stable map — avoids reallocating component config on every streamed token. */
const markdownComponents: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => (
    <ul className="my-2 list-disc space-y-1 pl-4">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 list-decimal space-y-1 pl-4">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed [&>p]:mb-0">{children}</li>
  ),
  h1: ({ children }) => (
    <h3 className="mb-1.5 mt-2 font-heading text-sm font-semibold tracking-tight first:mt-0">
      {children}
    </h3>
  ),
  h2: ({ children }) => (
    <h3 className="mb-1.5 mt-2 font-heading text-sm font-semibold tracking-tight first:mt-0">
      {children}
    </h3>
  ),
  h3: ({ children }) => (
    <h4 className="mb-1 mt-2 font-heading text-small font-semibold tracking-tight first:mt-0">
      {children}
    </h4>
  ),
  h4: ({ children }) => (
    <h4 className="mb-1 mt-2 font-heading text-small font-semibold tracking-tight first:mt-0">
      {children}
    </h4>
  ),
  h5: ({ children }) => (
    <p className="mb-1 mt-2 font-semibold first:mt-0">{children}</p>
  ),
  h6: ({ children }) => (
    <p className="mb-1 mt-2 font-semibold first:mt-0">{children}</p>
  ),
  code: ({ className: codeClassName, children, ...props }) => {
    const isBlock = Boolean(codeClassName?.includes("language-"));
    if (isBlock) {
      return (
        <code className={cn("font-mono text-[0.8125rem]", codeClassName)} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded-md bg-background/80 px-1 py-0.5 font-mono text-[0.8125rem] text-foreground"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-2 overflow-x-auto rounded-lg bg-background/80 p-2.5 font-mono text-[0.8125rem] leading-relaxed">
      {children}
    </pre>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-primary underline underline-offset-2 hover:text-brand-deep"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-border pl-3 text-muted-foreground">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-border" />,
};

/**
 * Renders the current assistant `content` string as Markdown.
 * Sync only (not MarkdownAsync) so each streamed state update paints immediately.
 * No raw HTML — react-markdown does not execute scripts.
 */
function ChatMarkdown({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  if (!content) return null;

  return (
    <div
      data-slot="chat-markdown"
      className={cn(
        "font-sans text-small leading-relaxed break-words [&_:first-child]:mt-0 [&_:last-child]:mb-0",
        className
      )}
    >
      <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
    </div>
  );
}

export { ChatMarkdown };
