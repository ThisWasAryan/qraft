import type { QRLogo } from '../domain/types';

export async function processLogo(logo: QRLogo): Promise<string> {
  if (!logo.plate || !logo.plate.enabled) {
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

      // We need to determine the output size.
      // Let's assume a fixed high-res internal size for crispness, then scale down.
      // 512x512 is a good base for the plate.
      const plateSize = 512;
      canvas.width = plateSize;
      canvas.height = plateSize;

      const padding = logo.plate!.padding;
      // Map padding (0-20ish) to internal pixels. Let's say padding is % of size.
      // Actually, padding in QRStyle is usually pixels relative to the QR size, but here we don't know the QR size.
      // Let's assume padding is a relative percentage of the logo's own dimension, or just a fixed ratio.
      // For simplicity, padding is used as a percentage (0-30%) of the plate size.
      const paddingRatio = padding / 100;
      const logoDrawSize = plateSize * (1 - paddingRatio * 2);
      const logoOffset = plateSize * paddingRatio;

      ctx.fillStyle = logo.plate!.color;
      
      if (logo.plate!.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(plateSize / 2, plateSize / 2, plateSize / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (logo.plate!.shape === 'rounded-square') {
        const radius = plateSize * 0.2; // 20% rounding
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(plateSize - radius, 0);
        ctx.quadraticCurveTo(plateSize, 0, plateSize, radius);
        ctx.lineTo(plateSize, plateSize - radius);
        ctx.quadraticCurveTo(plateSize, plateSize, plateSize - radius, plateSize);
        ctx.lineTo(radius, plateSize);
        ctx.quadraticCurveTo(0, plateSize, 0, plateSize - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.fill();
      } else {
        // square
        ctx.fillRect(0, 0, plateSize, plateSize);
      }

      // Draw the original image in the center
      ctx.drawImage(img, logoOffset, logoOffset, logoDrawSize, logoDrawSize);

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      reject(new Error('Failed to load logo image for processing'));
    };
    img.src = logo.src;
  });
}
