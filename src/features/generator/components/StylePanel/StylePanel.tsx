import React from 'react';
import { PatternSection } from './sections/PatternSection';
import { EyeSection } from './sections/EyeSection';
import { ColorSection } from './sections/ColorSection';
import { LogoSection } from './sections/LogoSection';
import { AdvancedSection } from './sections/AdvancedSection';
import { PresetBrowser } from '../PresetSelector/PresetBrowser';
import { Palette, Eye, Grid3x3, Image as ImageIcon, Settings } from 'lucide-react';
import styles from './StylePanel.module.css';

export const StylePanel: React.FC = () => {
  return (
    <div className={styles.container}>
      <PresetBrowser />

      <div className={styles.sectionGroup}>
        <h3 className={styles.header}>
          <Palette size={18} className={styles.icon} /> Colors
        </h3>
        <ColorSection />
      </div>

      <div className={styles.sectionGroup}>
        <h3 className={styles.header}>
          <Grid3x3 size={18} className={styles.icon} /> Appearance
        </h3>
        <PatternSection />
      </div>

      <div className={styles.sectionGroup}>
        <h3 className={styles.header}>
          <Eye size={18} className={styles.icon} /> Eyes
        </h3>
        <EyeSection />
      </div>

      <div className={styles.sectionGroup}>
        <h3 className={styles.header}>
          <ImageIcon size={18} className={styles.icon} /> Logo
        </h3>
        <LogoSection />
      </div>

      <div className={styles.sectionGroup}>
        <h3 className={styles.header}>
          <Settings size={18} className={styles.icon} /> Advanced
        </h3>
        <AdvancedSection />
      </div>
    </div>
  );
};
