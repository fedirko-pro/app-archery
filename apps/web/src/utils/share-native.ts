import { fetchImageAsShareFile } from './share-image';
import { buildShareBody } from './share-message';

export interface TournamentSharePayload {
  title: string;
  description?: string;
  url: string;
  imageUrl?: string;
}

/** Share via Web Share API with title, description, link, and banner image when supported. */
export async function shareTournamentNative(payload: TournamentSharePayload): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.share) {
    return false;
  }

  const text = buildShareBody(payload.title, payload.description);
  let shareData: ShareData = {
    title: payload.title,
    text,
    url: payload.url,
  };

  if (payload.imageUrl) {
    const file = await fetchImageAsShareFile(payload.imageUrl, `${payload.title}.jpg`);
    if (file) {
      const withFiles: ShareData = { ...shareData, files: [file] };
      if (navigator.canShare?.(withFiles)) {
        shareData = withFiles;
      }
    }
  }

  if (navigator.canShare && !navigator.canShare(shareData)) {
    return false;
  }

  try {
    await navigator.share(shareData);
    return true;
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      return false;
    }
    console.error('Native share failed:', err);
    return false;
  }
}
