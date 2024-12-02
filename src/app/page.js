'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from './components/Sidebar';
import Link from 'next/link';

function Content() {
  const searchParams = useSearchParams();
  const iframeSrc = searchParams.get('demo');

  // Map of keys to URLs
  const urlMap = {
    '3d-Model-AR':
      'https://adwood53.github.io/anything-immersive-demos/3D-Model-AR',
    '360-environments': 'https://example.com/360-environments',
    'swipeable-2d-content':
      'https://example.com/swipeable-2d-content',
    weblinks: 'https://example.com/weblinks',
  };

  const iframeUrl = iframeSrc && urlMap[iframeSrc];

  return (
    <>
      {iframeUrl && (
        <div className="embed-container">
          <iframe
            src={iframeUrl}
            width="100%"
            height="100%"
            allow="camera; fullscreen; xr-spatial-tracking"
            allowFullScreen
          ></iframe>
        </div>
      )}
    </>
  );
}

export default function Home() {
  return (
    <main>
      <Sidebar />
      <Suspense fallback={<p>Loading content...</p>}>
        <Content />
      </Suspense>
    </main>
  );
}
