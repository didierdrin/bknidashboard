/** Normalize product image values stored in Firestore (URL or base64 data URI). */
export function resolveProductImageSrc(src: string | undefined | null): string {
  if (!src) return '';
  const trimmed = src.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('data:image')) return trimmed;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `data:image/jpeg;base64,${trimmed}`;
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}
