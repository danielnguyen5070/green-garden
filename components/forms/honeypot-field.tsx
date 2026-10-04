import type { Ref } from "react";

/**
 * Hidden `website` field for `useBotSignals`. It is moved off-screen rather
 * than `display: none`, because many bots skip inputs they can tell are hidden.
 */
function HoneypotField({ ref }: { ref: Ref<HTMLInputElement> }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden opacity-0"
    >
      <label>
        Website
        <input
          ref={ref}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </label>
    </div>
  );
}

export { HoneypotField };
