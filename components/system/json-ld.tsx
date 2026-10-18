type JsonLdProps = {
  data: Record<string, unknown>;
};

/**
 * Renders Schema.org JSON-LD. Uses a native script tag (not next/script)
 * per Next.js JSON-LD guidance.
 */
function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export { JsonLd };
