import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { BlogPostMeta } from "@/types/blog";
import { cn } from "@/lib/utils";

function formatDate(date: string, locale = "en") {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(parsed);
}

function BlogCard({
  post,
  locale,
  readMoreLabel,
  className,
}: {
  post: BlogPostMeta;
  locale: string;
  readMoreLabel: string;
  className?: string;
}) {
  return (
    <article
      data-slot="blog-card"
      className={cn("group flex h-full flex-col", className)}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="flex h-full flex-col outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="relative overflow-hidden rounded-2xl bg-muted">
          <div className="relative aspect-[16/10] w-full">
            <Image
              src={post.cover}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2 font-sans text-small text-muted-foreground">
            {post.category ? (
              <span className="rounded-md bg-secondary px-2 py-0.5 text-[0.6875rem] font-semibold tracking-wide text-secondary-foreground uppercase">
                {post.category}
              </span>
            ) : null}
            <time dateTime={post.date}>{formatDate(post.date, locale)}</time>
          </div>

          <h2 className="font-heading text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
            {post.title}
          </h2>

          <p className="font-sans text-small text-muted-foreground">
            {post.description}
          </p>

          {post.tags.length > 0 ? (
            <ul className="mt-1 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-border bg-card px-2.5 py-0.5 font-sans text-[0.6875rem] text-muted-foreground"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}

          <span className="mt-auto pt-3 font-sans text-sm font-medium text-primary">
            {readMoreLabel}
          </span>
        </div>
      </Link>
    </article>
  );
}

export { BlogCard, formatDate };
