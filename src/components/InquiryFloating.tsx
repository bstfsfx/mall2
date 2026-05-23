'use client';

import { useState } from 'react';
import InquiryForm from './InquiryForm';
import styles from './InquiryFloating.module.css';

export default function InquiryFloating() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating chat button */}
      <button
        className={styles.fab}
        onClick={() => setIsOpen(true)}
        title="線上詢價"
        aria-label="打開詢價表單"
      >
        <span className={styles.fabIcon}>💬</span>
        <span className={styles.fabLabel}>線上詢價</span>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div className={styles.backdrop} onClick={() => setIsOpen(false)} />
      )}

      {/* Slide-in drawer */}
      <div className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerHeader}>
          <div>
            <h2>📩 線上詢價</h2>
            <p>有任何問題？我們很樂意為您解答</p>
          </div>
          <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>✕</button>
        </div>
        <div className={styles.drawerBody}>
          <InquiryForm />
        </div>
      </div>
    </>
  );
}