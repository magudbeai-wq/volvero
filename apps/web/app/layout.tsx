import type { Metadata, Viewport } from 'next';
import { Inter, Syne } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from 'react-hot-toast';
import { PostHogProvider } from '@/components/providers/PostHogProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'LAMAANE DOORE — Find Your Perfect Somali Match',
    template: '%s | LAMAANE DOORE',
  },
  description:
    'The world\'s most premium Somali dating platform. AI-powered matchmaking, luxury experience, real connections. Find your perfect match today.',
  keywords: [
    'Somali dating', 'Somali matchmaking', 'Muslim dating', 'Somali singles',
    'Somali marriage', 'halal dating', 'lamaane doore', 'Somali love',
  ],
  authors: [{ name: 'LAMAANE DOORE' }],
  creator: 'LAMAANE DOORE',
  publisher: 'LAMAANE DOORE',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://lamaanedoore.com'),
  alternates: {
    canonical: '/',
    languages: { 'en-US': '/en', 'ar': '/ar', 'so': '/so' },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'LAMAANE DOORE — Find Your Perfect Somali Match',
    description: 'The most premium Somali dating & matchmaking platform. AI-powered, culturally authentic, luxury experience.',
    siteName: 'LAMAANE DOORE',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'LAMAANE DOORE' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LAMAANE DOORE — Find Your Perfect Somali Match',
    description: 'The premium Somali dating platform. Real connections, AI matchmaking.',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#030311' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} ${syne.variable} font-sans antialiased`}>
          <ThemeProvider>
            <PostHogProvider>
              <QueryProvider>
                {children}
                <Toaster
                  position="top-center"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: 'rgba(22, 22, 48, 0.95)',
                      color: '#f3f4f6',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '16px',
                      backdropFilter: 'blur(20px)',
                      padding: '12px 16px',
                      fontSize: '14px',
                      fontWeight: '500',
                    },
                    success: {
                      iconTheme: { primary: '#8b5cf6', secondary: '#f3f4f6' },
                    },
                    error: {
                      iconTheme: { primary: '#ef4444', secondary: '#f3f4f6' },
                    },
                  }}
                />
              </QueryProvider>
            </PostHogProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
