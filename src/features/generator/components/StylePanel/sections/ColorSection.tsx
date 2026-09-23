import React from 'react';
import { useQRStore } from '../../../../../stores/qrStore';
import { AdvancedColorPicker } from '../../../../../components/ColorPicker/AdvancedColorPicker';
import type { QRGradient } from '../../../../../domain/types';

export const ColorSection: React.FC = () => {
  const dotColor = useQRStore((state) => state.config.style.dotOptions.color);
  const bgColor = useQRStore((state) => state.config.style.backgroundOptions.color);
  const squareColor = useQRStore((state) => state.config.style.cornerSquareOptions.color) || dotColor;
  const cornerDotColor = useQRStore((state) => state.config.style.cornerDotOptions.color) || squareColor;
  const setStyle = useQRStore((state) => state.setStyle);

  const dotGradient = useQRStore((state) => state.config.style.dotOptions.gradient);
  const bgGradient = useQRStore((state) => state.config.style.backgroundOptions.gradient);
  const squareGradient = useQRStore((state) => state.config.style.cornerSquareOptions.gradient) || dotGradient;
  const cornerDotGradient = useQRStore((state) => state.config.style.cornerDotOptions.gradient) || squareGradient;

  const handleDotColorChange = (color: string, gradient?: QRGradient) => {
    setStyle({ dotOptions: { ...useQRStore.getState().config.style.dotOptions, color, gradient } });
  };

  const handleBgColorChange = (color: string, gradient?: QRGradient) => {
    setStyle({ backgroundOptions: { ...useQRStore.getState().config.style.backgroundOptions, color, gradient } });
  };

  const handleSquareColorChange = (color: string, gradient?: QRGradient) => {
    setStyle({ cornerSquareOptions: { ...useQRStore.getState().config.style.cornerSquareOptions, color, gradient } });
  };

  const handleCornerDotColorChange = (color: string, gradient?: QRGradient) => {
    setStyle({ cornerDotOptions: { ...useQRStore.getState().config.style.cornerDotOptions, color, gradient } });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      <AdvancedColorPicker
        label="Pattern Color"
        color={dotColor}
        gradient={dotGradient}
        onChange={handleDotColorChange}
      />
      <AdvancedColorPicker
        label="Background Color"
        color={bgColor}
        gradient={bgGradient}
        onChange={handleBgColorChange}
      />
      <AdvancedColorPicker
        label="Eye Frame Color"
        color={squareColor}
        gradient={squareGradient}
        onChange={handleSquareColorChange}
      />
      <AdvancedColorPicker
        label="Eye Center Color"
        color={cornerDotColor}
        gradient={cornerDotGradient}
        onChange={handleCornerDotColorChange}
      />
    </div>
  );
};
