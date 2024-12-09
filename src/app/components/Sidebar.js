'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(16);
  const router = useRouter();

  useEffect(() => {
    const sidebarElement = document.querySelector(
      `.${styles.sidebar}`
    );
    if (sidebarElement) {
      const width = isOpen ? sidebarElement.offsetWidth : 0;
      setSidebarWidth(width);
    }
  }, [isOpen]);

  const handleNavClick = (key) => {
    router.push(`/?demo=${encodeURIComponent(key)}`);
  };

  return (
    <div className={`${styles.fixedContainer} flex`}>
      <div
        className={`${styles.sidebar} ${
          isOpen ? styles.sidebarOpen : styles.sidebarClosed
        }`}
        style={{ width: isOpen ? '16rem' : '5rem' }}
      >
        <img
          className={`${styles.logo}`}
          src="images/branding/voyager-full-logo.png"
          alt="Voyager Logo"
        />
        <div className={styles.listContent}>
          <h1>NFC Demos</h1>
          <ul className={styles.nav}>
            <li>
              <button onClick={() => handleNavClick('3D-Model-AR')}>
                3D Model (AR)
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick('3D-Model-VR')}>
                360° 3D Model (VR)
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('swipeable-2d-content')}
              >
                Swipeable 2D Content
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick('weblinks')}>
                WebLinks
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('SLAM-Video-Test')}
              >
                SLAM Video Test
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div
        className={`${styles.content} flex-1 p-4 ${
          isOpen ? styles.contentShifted : styles.contentShiftedBack
        }`}
      >
        <button
          className={styles.toggleButton}
          onClick={() => setIsOpen(!isOpen)}
          style={{
            left: isOpen ? `calc(${sidebarWidth}px + 20px)` : '20px',
          }}
        >
          {isOpen ? (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
