import type { QRDotType, QRCornerSquareType, QRCornerDotType, QRGradient, QRDesignPalette } from '../types';

function getRandomColor(): string {
  // Generate vibrant, visible colors (avoiding overly dark or light in HSL)
  const hue = Math.floor(Math.random() * 360);
  const saturation = 70 + Math.floor(Math.random() * 30); // 70-100%
  const lightness = 30 + Math.floor(Math.random() * 40); // 30-70%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function getRandomBackgroundColor(): string {
  // Either white (50% chance) or a very light pastel, or rarely a dark color
  const rand = Math.random();
  if (rand < 0.5) return '#FFFFFF';
  if (rand < 0.9) {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 30%, 95%)`;
  }
  // Dark background
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 30%, 15%)`;
}

function getRandomGradient(baseColor: string): QRGradient | undefined {
  if (Math.random() > 0.5) return undefined; // 50% chance of solid color
  
  // Create a contrasting or analogous secondary color
  const secondaryHue = Math.floor(Math.random() * 360);
  const secondaryColor = `hsl(${secondaryHue}, 80%, 50%)`;

  return {
    type: Math.random() > 0.5 ? 'linear' : 'radial',
    rotation: Math.random() * Math.PI * 2, // 0 to 2PI radians
    colorStops: [
      { offset: 0, color: baseColor },
      { offset: 1, color: secondaryColor }
    ]
  };
}

export function generateRandomPalette(): Omit<QRDesignPalette, 'id' | 'name'> {
  const dotTypes: QRDotType[] = ['square', 'dots', 'rounded', 'classy', 'classy-rounded', 'extra-rounded'];
  const squareTypes: QRCornerSquareType[] = ['square', 'dot', 'extra-rounded', 'dots', 'rounded', 'classy', 'classy-rounded'];
  const cornerDotTypes: QRCornerDotType[] = ['square', 'dot'];

  const dotColor = getRandomColor();
  const squareColor = Math.random() > 0.3 ? dotColor : getRandomColor();
  const cornerDotColor = Math.random() > 0.3 ? squareColor : getRandomColor();
  
  return {
    dotOptions: {
      type: dotTypes[Math.floor(Math.random() * dotTypes.length)],
      color: dotColor,
      gradient: getRandomGradient(dotColor),
    },
    cornerSquareOptions: {
      type: squareTypes[Math.floor(Math.random() * squareTypes.length)],
      color: squareColor,
      gradient: Math.random() > 0.8 ? getRandomGradient(squareColor) : undefined,
    },
    cornerDotOptions: {
      type: cornerDotTypes[Math.floor(Math.random() * cornerDotTypes.length)],
      color: cornerDotColor,
      gradient: Math.random() > 0.8 ? getRandomGradient(cornerDotColor) : undefined,
    },
    backgroundOptions: {
      color: getRandomBackgroundColor(),
      // Rarely add background gradient to prevent too much chaos
      gradient: Math.random() > 0.9 ? getRandomGradient(getRandomBackgroundColor()) : undefined,
    }
  };
}
