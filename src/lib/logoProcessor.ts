import type { QRLogo } from '../domain/types';

export async function processLogo(logo: QRLogo): Promise<string> {
  const hasPlate = logo.plate && logo.plate.enabled;
  const hasOpacity = logo.opacity !== undefined && logo.opacity < 1;

  if (!hasPlate && !hasOpacity) {
    return logo.src;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(logo.src);
        return;
      }

      // If we don't have a plate, the canvas shouldn't be hardcoded to 512x512
      // because we want the logo's native aspect ratio or just a standard size.
      // We can stick to 512x512 but the logo might be stretched if we are not careful.
      // Wait, drawImage with 4 args scales the image. We should preserve aspect ratio.
      const plateSize = 512;
      
      let canvasW = plateSize;
      let canvasH = plateSize;
      
      if (!hasPlate) {
         // Use the image's original dimensions to avoid distortion
         canvasW = img.width;
         canvasH = img.height;
      }

      canvas.width = canvasW;
      canvas.height = canvasH;

      if (hasPlate) {
        const padding = logo.plate!.padding;
        const paddingRatio = padding / 100;
        const logoDrawSizeW = canvasW * (1 - paddingRatio * 2);
        const logoDrawSizeH = canvasH * (1 - paddingRatio * 2);
        const logoOffsetX = canvasW * paddingRatio;
        const logoOffsetY = canvasH * paddingRatio;

        ctx.fillStyle = logo.plate!.color;
        
        if (logo.plate!.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(canvasW / 2, canvasH / 2, Math.min(canvasW, canvasH) / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (logo.plate!.shape === 'rounded-square') {
          const radius = Math.min(canvasW, canvasH) * 0.2; 
          ctx.beginPath();
          ctx.moveTo(radius, 0);
          ctx.lineTo(canvasW - radius, 0);
          ctx.quadraticCurveTo(canvasW, 0, canvasW, radius);
          ctx.lineTo(canvasW, canvasH - radius);
          ctx.quadraticCurveTo(canvasW, canvasH, canvasW - radius, canvasH);
          ctx.lineTo(radius, canvasH);
          ctx.quadraticCurveTo(0, canvasH, 0, canvasH - radius);
          ctx.lineTo(0, radius);
          ctx.quadraticCurveTo(0, 0, radius, 0);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillRect(0, 0, canvasW, canvasH);
        }

        ctx.globalAlpha = logo.opacity ?? 1;
        ctx.drawImage(img, logoOffsetX, logoOffsetY, logoDrawSizeW, logoDrawSizeH);
      } else {
        ctx.globalAlpha = logo.opacity ?? 1;
        ctx.drawImage(img, 0, 0, canvasW, canvasH);
      }

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      reject(new Error('Failed to load logo image for processing'));
    };
    img.src = logo.src;
  });
}
