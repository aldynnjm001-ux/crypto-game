import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bonsure Clone - Crypto Mining Simulator',
  description: 'Gaming system for making money. 1 Emerald = 1 USD.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
