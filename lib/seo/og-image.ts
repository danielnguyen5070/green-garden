const DEFAULT_OG_IMAGE_URL = "/images/og-home.jpg";
const DEFAULT_OG_IMAGE_WIDTH = 1200;
const DEFAULT_OG_IMAGE_HEIGHT = 630;

type OgImage = {
  url: string;
  alt: string;
  width?: number;
  height?: number;
};

/**
 * Social share image, falling back to the site default so every page shows
 * a preview on Zalo / Facebook. Only the default declares dimensions:
 * authored images come in any size, and wrong dimensions make crawlers crop.
 */
function resolveOgImage(url: string | null | undefined, alt: string): OgImage {
  const trimmed = url?.trim();
  if (trimmed) {
    return { url: trimmed, alt };
  }

  return {
    url: DEFAULT_OG_IMAGE_URL,
    width: DEFAULT_OG_IMAGE_WIDTH,
    height: DEFAULT_OG_IMAGE_HEIGHT,
    alt,
  };
}

export { resolveOgImage, type OgImage };
