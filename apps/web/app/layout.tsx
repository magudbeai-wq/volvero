import type { Metadata, Viewport } from 'next';
import { Inter, Syne } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { PostHogProvider } from '@/components/providers/PostHogProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Analytics } from '@vercel/analytics/next';
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
    default: 'VOLVERO — Connect Beyond Borders',
    template: '%s | VOLVERO',
  },
  description:
    'The world\'s most premium dating platform. Find meaningful connections anywhere in the world. Smart matchmaking, luxury experience, real connections.',
  keywords: [
    'dating', 'matchmaking', 'premium dating', 'singles', 'international dating', 'volvero', 'connections', 'relationships'
  ],
  authors: [{ name: 'VOLVERO Team' }],
  creator: 'VOLVERO',
  publisher: 'VOLVERO',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://volvero.com'),
  alternates: {
    canonical: '/',
    languages: { 'en-US': '/en' },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'VOLVERO — Connect Beyond Borders',
    description: 'The most premium dating & matchmaking platform. Find meaningful connections anywhere in the world.',
    siteName: 'VOLVERO',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'VOLVERO' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VOLVERO — Connect Beyond Borders',
    description: 'The premium dating platform. Real connections, smart matchmaking.',
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
    { media: '(prefers-color-scheme: dark)', color: '#0B1020' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
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
                    background: 'rgba(19, 26, 43, 0.95)',
                    color: '#f3f4f6',
                    border: '1px solid rgba(124, 58, 237, 0.3)',
                    borderRadius: '16px',
                    backdropFilter: 'blur(20px)',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                  },
                  success: {
                    iconTheme: { primary: '#7C3AED', secondary: '#f3f4f6' },
                  },
                  error: {
                    iconTheme: { primary: '#ef4444', secondary: '#f3f4f6' },
                  },
                }}
              />
              <Analytics />
            </QueryProvider>
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
