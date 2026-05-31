import './globals.css';
import type { Metadata, Viewport } from 'next';
import { VT323, Space_Mono, Major_Mono_Display } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/config';

const vt = VT323({ subsets: ['latin'], weight: '400', variable: '--font-vt323' });
const sm = Space_Mono({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-space-mono' });
const mm = Major_Mono_Display({ subsets: ['latin'], weight: '400', variable: '--font-major-mono' });

export const metadata: Metadata = {
  applicationName: 'Damacana',
  title: 'Damacana',
  description: 'A cosmic ship defense incremental game.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, title: 'Damacana', statusBarStyle: 'black-translucent' },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#05010d',
  colorScheme: 'dark',
};

export function generateStaticParams() {
  return locales.map((l) => ({ locale: l }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as (typeof locales)[number])) notFound();
  unstable_setRequestLocale(locale);
  const messages = await getMessages();
  return (
    <html lang={locale} className={`${vt.variable} ${sm.variable} ${mm.variable}`}>
      <body className="bg-[#05010d] antialiased">
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
