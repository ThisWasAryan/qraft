import React from 'react';
import { Code2, Briefcase, Camera, Mail, Heart } from 'lucide-react';
import styles from './FooterCredits.module.css';

export const FooterCredits: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.madeBy}>
        Made with <Heart size={14} className={styles.heart} /> by Aryan Raj
      </div>
      <div className={styles.links}>
        <a href="https://github.com/ThisWasAryan" target="_blank" rel="noreferrer" className={styles.link}>
          <Code2 size={16} /> GitHub
        </a>
        <a href="https://linkedin.com/in/thiswasaryan1" target="_blank" rel="noreferrer" className={styles.link}>
          <Briefcase size={16} /> LinkedIn
        </a>
        <a href="https://instagram.com/drugd3alers" target="_blank" rel="noreferrer" className={styles.link}>
          <Camera size={16} /> Instagram
        </a>
        <a href="mailto:hi@thiswasaryan.in" className={styles.link}>
          <Mail size={16} /> hi@thiswasaryan.in
        </a>
      </div>
    </footer>
  );
};
