import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ANAM USSD Liberia',
  description: 'USSD Simulator for UNDP Wallet Service in Liberia',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
