import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ascend Cricket Academy',
  description: 'World-class cricket training at Ascend Cricket Academy. Expert coaching, premium facilities, and a champion mindset.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=League+Gothic&family=Racing+Sans+One&family=Outfit:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
