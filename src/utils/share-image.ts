/** Rewrite API image URLs to same-origin proxy in dev so fetch() works from the browser. */
export function toFetchableImageUrl(imageUrl: string): string {
  if (imageUrl.startsWith('/') || imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  try {
    const parsed = new URL(imageUrl);
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (typeof window !== 'undefined' && apiBase?.startsWith('http')) {
      const apiOrigin = new URL(apiBase).origin;
      if (parsed.origin === apiOrigin) {
        return `/api${parsed.pathname}${parsed.search}`;
      }
    }
  } catch {
    return imageUrl;
  }

  return imageUrl;
}

export async function fetchImageAsShareFile(
  imageUrl: string,
  filename: string,
): Promise<File | null> {
  try {
    const response = await fetch(toFetchableImageUrl(imageUrl));
    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();
    if (!blob.type.startsWith('image/')) {
      return null;
    }

    const extension = blob.type.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
    const safeName = filename.replace(/[^\w.-]+/g, '-').replace(/\.[^.]+$/, '') || 'tournament';
    return new File([blob], `${safeName}.${extension}`, { type: blob.type });
  } catch {
    return null;
  }
}
