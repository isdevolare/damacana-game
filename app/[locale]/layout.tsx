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
  title: 'damacana.exe',
  description: 'a cosmic-absurd idle / clicker game',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, title: 'damacana', statusBarStyle: 'black-translucent' },
  icons: { apple: '/apple-touch-icon.png' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#05010d',
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
      <body>
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
