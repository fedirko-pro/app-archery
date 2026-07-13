const DEFAULT_MAX_DIMENSION = 2048;

export interface DownscaleImageOptions {
  maxDimension?: number;
  mimeType?: string;
  quality?: number;
}

function loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to encode image'));
      },
      mimeType,
      quality,
    );
  });
}

/** Downscale an image file for mobile-friendly memory use. Returns original if already small enough. */
export async function downscaleImageFile(
  file: File,
  options: DownscaleImageOptions = {},
): Promise<{ file: File; dataUrl: string }> {
  const maxDimension = options.maxDimension ?? DEFAULT_MAX_DIMENSION;
  const mimeType = options.mimeType ?? (file.type || 'image/jpeg');
  const quality = options.quality ?? 0.92;

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });

  const image = await loadImageFromDataUrl(dataUrl);
  const { naturalWidth: width, naturalHeight: height } = image;

  if (width <= maxDimension && height <= maxDimension) {
    return { file, dataUrl };
  }

  const scale = Math.min(maxDimension / width, maxDimension / height);
  const targetWidth = Math.round(width * scale);
  const targetHeight = Math.round(height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { file, dataUrl };
  }

  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
  const blob = await canvasToBlob(canvas, mimeType, quality);
  const resizedFile = new File([blob], file.name, { type: mimeType, lastModified: Date.now() });
  const resizedDataUrl = canvas.toDataURL(mimeType, quality);

  return { file: resizedFile, dataUrl: resizedDataUrl };
}

export function computeDownscaledDimensions(
  width: number,
  height: number,
  maxDimension = DEFAULT_MAX_DIMENSION,
): { width: number; height: number } {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }
  const scale = Math.min(maxDimension / width, maxDimension / height);
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}
