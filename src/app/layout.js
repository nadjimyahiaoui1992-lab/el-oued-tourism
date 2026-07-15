import { Cairo, Lalezar, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

// الخط الأساسي (نصوص وواجهة)
const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700', '900'],
  variable: '--font-cairo',
});

// خط العنونة المميز (اللوغو والعناوين الكبرى فقط)
const lalezar = Lalezar({
  subsets: ['arabic'],
  weight: ['400'],
  variable: '--font-lalezar',
});

// خط دقيق للأرقام والبيانات الصغيرة
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-plex-mono',
});

export const metadata = {
  title: 'اكتشف سوف | الدليل السياحي',
  description: 'الدليل السياحي الشامل لولاية الوادي، مدينة الألف قبة وبوابة الصحراء الكبرى',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#b5502e',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${lalezar.variable} ${plexMono.variable}`}>
      <body className="font-sans bg-sand-light text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
