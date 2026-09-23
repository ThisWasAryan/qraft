// Loads custom fonts used in CTA text before rendering onto canvas

export const loadFont = async (fontFamily: string, url: string): Promise<void> => {
  if (typeof document === 'undefined') return;
  
  // Check if already loaded
  if (document.fonts) {
    const isLoaded = Array.from(document.fonts).some((font) => font.family === fontFamily);
    if (isLoaded) return;
  }

  try {
    const font = new FontFace(fontFamily, `url(${url})`);
    await font.load();
    document.fonts.add(font);
  } catch (err) {
    console.error(`Failed to load font ${fontFamily}`, err);
  }
};
