import { buildShareBody, buildShareMessage } from './share-message';

export interface ShareLinks {
  whatsapp: string;
  telegram: string;
  facebook: string;
  twitter: string;
  linkedin: string;
  email: string;
}

export function buildShareLinks(url: string, title: string, text?: string): ShareLinks {
  const body = buildShareBody(title, text);
  const message = buildShareMessage(title, text, url);

  const encodedUrl = encodeURIComponent(url);
  const encodedBody = encodeURIComponent(body);
  const encodedMessage = encodeURIComponent(message);
  const encodedSubject = encodeURIComponent(title);

  return {
    whatsapp: `https://wa.me/?text=${encodedMessage}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedBody}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedBody}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedSubject}&body=${encodedMessage}`,
  };
}
