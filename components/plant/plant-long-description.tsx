import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

const EXTERNAL_LINK = /^https?:\/\//i;

/** react-markdown passes its AST `node`, which must not reach the DOM. */
function domProps<T extends { node?: unknown }>(props: T): Omit<T, "node"> {
  const rest = { ...props };
  delete rest.node;
  return rest;
}

/** The page title is the only `h1`; Markdown headings start at `h2`. */
const markdownComponents: Components = {
  h1: (props) => <h2 {...domProps(props)} />,
  a: (props) =>
    props.href && EXTERNAL_LINK.test(props.href) ? (
      <a target="_blank" rel="noopener noreferrer" {...domProps(props)} />
    ) : (
      <a {...domProps(props)} />
    ),
  table: (props) => (
    <div className="overflow-x-auto">
      <table {...domProps(props)} />
    </div>
  ),
  img: (props) => (
    // eslint-disable-next-line @next/next/no-img-element -- admin Markdown images have unknown dimensions
    <img
      alt=""
      loading="lazy"
      className="rounded-xl"
      {...domProps(props)}
    />
  ),
};

/** Admin-authored Markdown (GFM). Raw HTML is not rendered. */
function PlantLongDescription({
  source,
  className,
}: {
  source: string;
  className?: string;
}) {
  return (
    <div
      data-slot="plant-long-description"
      className={cn(
        "prose max-w-3xl font-sans leading-relaxed text-muted-foreground prose-headings:font-heading prose-headings:tracking-tight prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-blockquote:border-primary/30 prose-blockquote:text-muted-foreground prose-code:rounded-md prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:font-normal prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none prose-pre:bg-muted prose-pre:text-foreground prose-li:text-muted-foreground prose-th:text-foreground prose-td:text-muted-foreground prose-hr:border-border",
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {source}
      </ReactMarkdown>
    </div>
  );
}

export { PlantLongDescription };
