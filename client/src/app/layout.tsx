import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'GoChat',
  description: 'Jednostavna chat aplikacija',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="hr">
      <head />
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
