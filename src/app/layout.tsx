import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kabaddi Game - 2D Browser Game',
  description: 'Experience the thrill of Kabaddi in this exciting 2D browser game. Control the raider, avoid defenders, and score points!',
  keywords: 'kabaddi, game, 2d, browser, raider, defender, sports',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}