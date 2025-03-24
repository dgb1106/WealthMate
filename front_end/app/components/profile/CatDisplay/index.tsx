'use client'

import React from 'react';
import styles from './styles.module.css';

interface CatDisplayProps {
  currentBalance: number;
}

const CatDisplay: React.FC<CatDisplayProps> = ({ currentBalance }) => {
  return (
    <div className={styles.catColumn}>
      <div className={styles.cat}>
        <div className={styles.body}></div>
        <div className={styles["body-merge"]}></div>
        <div className={styles["ear-left"]}></div>
        <div className={styles["ear-right"]}></div>
        <div className={`${styles["eye"]} ${styles["eye__left"]}`}></div>
        <div className={`${styles["eye"]} ${styles["eye__right"]}`}></div>
        <div className={styles["mouth-left"]}></div>
        <div className={styles["mouth-right"]}></div>
        <div className={`${styles["paw"]} ${styles["paw__left"]}`}>
          <div className={`${styles["paw-detail-small"]} ${styles["paw-detail__top"]}`}></div>
          <div className={`${styles["paw-detail-small"]} ${styles["paw-detail__left"]}`}></div>
          <div className={`${styles["paw-detail-small"]} ${styles["paw-detail__right"]}`}></div>
          <div className={`${styles["paw-detail-large"]} ${styles["paw-detail__bottom"]}`}></div>
        </div>
        <div className={styles["paw-right-down"]}></div>
        <div className={styles["paw-merge-right"]}></div>
        <div className={styles["desk"]}></div>
        
        <div className={`${styles.balanceOnDesk} ${currentBalance < 0 ? styles.balanceNegative : styles.balancePositive}`}>
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentBalance * 1000)}
        </div>
      </div>
    </div>
  );
};

export default CatDisplay;