/** Static import from Next.js (object) or Vite/webpack URL string. */
export type StaticAssetImport = string | { src: string };

/** Resolve a bundled image/SVG import to a URL for img src / MUI image props. */
export function assetUrl(imported: StaticAssetImport): string {
  if (typeof imported === 'string') {
    return imported;
  }
  return imported.src;
}
