import { Exo_2 } from 'next/font/google';
import './globals.css';

const exo2 = Exo_2({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-exo-2',
  weight: [
    '100',
    '200',
    '300',
    '400',
    '500',
    '600',
    '700',
    '800',
    '900',
  ],
});

export const metadata = {
  title: 'Voyager NFC Demos',
  description: 'Showcasing examples using XR and NFC technology.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${exo2.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
