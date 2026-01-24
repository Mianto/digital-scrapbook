import type { Metadata } from 'next';
import { Caveat, Crimson_Text } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
});

const crimsonText = Crimson_Text({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-crimson',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Our Digital Scrapbook',
  description: 'A collection of our memories together',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${caveat.variable} ${crimsonText.variable}`}>
      <body className="paper-texture min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
