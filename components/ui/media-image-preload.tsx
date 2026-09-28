"use client";

import { getImageProps, type ImageProps } from "next/image";
import { preload } from "react-dom";

type MediaImagePreloadProps = Pick<
  ImageProps,
  "src" | "sizes" | "fill" | "width" | "height" | "quality"
> & {
  /** Media query the preload is limited to, e.g. `(min-width: 768px)`. */
  media: string;
};

/**
 * Preloads an image only for viewports matching `media`, for images that are
 * hidden elsewhere (`<Image preload>` preloads on every viewport).
 * Pass the same `src`/`sizes`/`fill`/`quality` as the rendered `<Image>`,
 * otherwise the browser downloads two different candidates.
 */
function MediaImagePreload({ media, ...imageProps }: MediaImagePreloadProps) {
  const { props } = getImageProps({ ...imageProps, alt: "" });

  preload(props.src, {
    as: "image",
    imageSrcSet: props.srcSet,
    imageSizes: props.sizes,
    fetchPriority: "high",
    media,
  });

  return null;
}

export { MediaImagePreload };
