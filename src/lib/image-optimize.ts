import sharp from "sharp";

// Matches image-compression.ts's own MAX_DIMENSION (client-side, best-effort
// — see that file) — this is the real, enforced ceiling every gallery/About-
// embed photo is resized to here, regardless of what the client sent.
export const GALLERY_PHOTO_MAX_DIMENSION = 1600;
// Matches crop-image.ts's own OUTPUT_SIZE (the crop tool's square output) —
// every logo, however it arrived (a raw upload, the crop tool, or AI Auto
// Create's fetched photo), is normalized to this same ceiling here too.
export const LOGO_MAX_DIMENSION = 512;

export type OptimizedImage = { buffer: Buffer; contentType: string };

// Every image this app stores goes through here first. The client already
// best-effort compresses on its own (image-compression.ts, crop-image.ts),
// but neither is enforced — a non-browser caller, or a photo the browser's
// canvas can't decode (HEIC), skips it entirely. Resizes to fit within
// maxDimension (never upscales).
//
// format defaults to WebP — smaller than JPEG at the same quality — for
// gallery/About-embed photos, which only ever render in a normal <img>.
// Pass "png" for a logo: it's the one image embedded directly into
// opengraph-image.tsx's <img src={listing.logoUrl}>, rendered through
// Next's built-in (Satori-based) ImageResponse rather than a browser, and
// that renderer throws on a WebP data: URL — confirmed by hand, not by
// documentation. PNG also keeps a logo's transparency, which WebP would
// too, but PNG is the one both renderers agree on.
//
// Animated GIFs pass through untouched either way, since re-encoding one
// through sharp's default (single-frame) pipeline would silently drop the
// animation, and they're rare enough here not to be worth handling.
export async function optimizeImageForWeb(
  buffer: Buffer,
  contentType: string,
  maxDimension: number,
  format: "webp" | "png" = "webp",
): Promise<OptimizedImage> {
  if (contentType === "image/gif") return { buffer, contentType };
  try {
    const resized = sharp(buffer)
      .rotate()
      .resize({ width: maxDimension, height: maxDimension, fit: "inside", withoutEnlargement: true });
    const optimized = format === "webp" ? await resized.webp({ quality: 82 }).toBuffer() : await resized.png({ compressionLevel: 9 }).toBuffer();
    return { buffer: optimized, contentType: format === "webp" ? "image/webp" : "image/png" };
  } catch {
    // Bytes that don't actually decode as the declared content type — store
    // what was uploaded rather than fail the action; the same validation
    // (allowed type, size cap) already ran on the caller's side either way.
    return { buffer, contentType };
  }
}
