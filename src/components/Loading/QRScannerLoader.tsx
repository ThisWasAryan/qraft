import React, { useEffect, useState } from 'react';
import styles from './QRScannerLoader.module.css';

export const QRScannerLoader: React.FC = () => {
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPercentage(prev => {
        if (prev >= 99) {
          clearInterval(interval);
          return 99;
        }
        return prev + Math.floor(Math.random() * 15) + 1;
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.loaderContainer}>
      <div className={styles.scanner}>
        <div className={styles.scanLine} />
      </div>
      <div className={styles.percentage}>Loading... {percentage}%</div>
    </div>
  );
};
