'use client';

import dynamic from 'next/dynamic';

const Scene = dynamic(() => import('./components/Scene'), {
  ssr: false,
});

function Home() {
  return (
    <div>
      <Scene />
    </div>
  );
}

export default Home;
