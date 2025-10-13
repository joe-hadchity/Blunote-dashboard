import { Inter } from 'next/font/google';
import './globals.css';
import type { Metadata } from 'next';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import LoadingBar from '@/components/common/LoadingBar';
import CookieConsent from '@/components/common/CookieConsent';

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Bluenote - AI-Powered Meeting Assistant & Calendar Management',
  description: 'Bluenote provides AI-powered noise cancellation, real-time transcription, and intelligent meeting management for seamless collaboration.',
  icons: {
    icon: [
      { url: '/images/logo/logo-icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/images/logo/logo-icon.png',
    apple: '/images/logo/logo-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/images/logo/logo-icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/logo/logo-icon.png" />
        <link rel="shortcut icon" href="/images/logo/logo-icon.png" />
      </head>
      <body className={`${inter.className} dark:bg-gray-900`}>
        <LoadingBar />
        <AuthProvider>
          <ThemeProvider>
            <SidebarProvider>
              {children}
              <CookieConsent />
            </SidebarProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
