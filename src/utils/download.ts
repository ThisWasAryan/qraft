export type ExportFormat = 'png' | 'svg' | 'jpeg' | 'webp';

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function copyBlobToClipboard(blob: Blob): Promise<void> {
  if (!navigator.clipboard) {
    throw new Error('Clipboard API not supported');
  }
  
  try {
    const item = new ClipboardItem({ [blob.type]: blob });
    await navigator.clipboard.write([item]);
  } catch (error) {
    throw new Error('Failed to copy to clipboard');
  }
}
