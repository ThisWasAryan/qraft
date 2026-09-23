import type { QRConfig } from '../domain/types';

export async function createCompositeCanvas(
  qrCanvas: HTMLCanvasElement,
  config: QRConfig,
  scale: number = 1
): Promise<HTMLCanvasElement> {
  const { frame } = config.style;

  if (!frame || frame.style === 'none') {
    // No frame, just return a scaled version if needed, or the original
    if (scale === 1) return qrCanvas;
    
    const c = document.createElement('canvas');
    c.width = qrCanvas.width * scale;
    c.height = qrCanvas.height * scale;
    const ctx = c.getContext('2d');
    if (ctx) {
      ctx.drawImage(qrCanvas, 0, 0, c.width, c.height);
    }
    return c;
  }

  const baseQRSize = qrCanvas.width; // Assume square for the inner QR
  const padding = frame.padding;
  
  // Base dimensions (scale = 1)
  let outerWidth = baseQRSize + (padding * 2);
  let outerHeight = baseQRSize + (padding * 2);
  let qrOffsetX = padding;
  let qrOffsetY = padding;
  
  let ctaHeight = 0;
  if (frame.ctaText) {
    ctaHeight = frame.ctaText.fontSize * 1.5 + frame.padding; // Rough height for text area
    outerHeight += ctaHeight;
    if (frame.ctaText.position === 'top') {
      qrOffsetY += ctaHeight;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = outerWidth * scale;
  canvas.height = outerHeight * scale;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return qrCanvas;

  ctx.scale(scale, scale);

  // Draw Frame Background
  ctx.fillStyle = frame.backgroundColor;
  const radius = frame.borderRadius;

  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(outerWidth - radius, 0);
  ctx.quadraticCurveTo(outerWidth, 0, outerWidth, radius);
  ctx.lineTo(outerWidth, outerHeight - radius);
  ctx.quadraticCurveTo(outerWidth, outerHeight, outerWidth - radius, outerHeight);
  ctx.lineTo(radius, outerHeight);
  ctx.quadraticCurveTo(0, outerHeight, 0, outerHeight - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();

  // Draw Frame Border
  if (frame.borderWidth > 0) {
    ctx.lineWidth = frame.borderWidth;
    ctx.strokeStyle = frame.color;
    ctx.stroke();
  }

  // Draw Base QR
  ctx.drawImage(qrCanvas, qrOffsetX, qrOffsetY, baseQRSize, baseQRSize);

  // Draw CTA Text
  if (frame.ctaText) {
    ctx.fillStyle = frame.ctaText.color;
    const fontString = `${frame.ctaText.fontWeight} ${frame.ctaText.fontSize}px "${frame.ctaText.fontFamily}"`;
    ctx.font = fontString;
    ctx.letterSpacing = `${frame.ctaText.letterSpacing}px`;
    ctx.textAlign = frame.ctaText.alignment;
    ctx.textBaseline = 'middle';

    let textX = outerWidth / 2;
    if (frame.ctaText.alignment === 'left') {
      textX = padding;
    } else if (frame.ctaText.alignment === 'right') {
      textX = outerWidth - padding;
    }

    let textY = padding + (frame.ctaText.fontSize / 2);
    if (frame.ctaText.position === 'bottom') {
      textY = outerHeight - padding - (frame.ctaText.fontSize / 2);
    }

    ctx.fillText(frame.ctaText.text, textX, textY);
  }

  return canvas;
}
