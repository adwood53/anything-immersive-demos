'use client';

import Head from 'next/head';
import Script from 'next/script';

function Layout({ children }) {
  return (
    <>
      <Head>
        <title>3D AR Model Viewer</title>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, user-scalable=no, heigh=device-height"
        />
      </Head>
      <Script
        src="https://aframe.io/releases/1.6.0/aframe.min.js"
        strategy="beforeInteractive"
      />
      <main>{children}</main>
    </>
  );
}

export default Layout;
