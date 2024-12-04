'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

function Home() {
  const [template, setTemplate] = useState(null);
  
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  useEffect(() => {
    fetch(`${basePath}/3D-Model-VR/template.json`)
      .then((response) => response.json())
      .then(setTemplate)
      .catch((error) => console.error('Error loading template.json:', error));
  }, [basePath]);
  
  const Scene = dynamic(() => import('@/components/Scene'), { ssr: false, });

  return (
    <div>
      <Scene template={template} />
    </div>
  );
}

export default Home;
