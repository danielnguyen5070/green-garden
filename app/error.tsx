"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <p>Something went wrong.</p>
      <button type="button" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
