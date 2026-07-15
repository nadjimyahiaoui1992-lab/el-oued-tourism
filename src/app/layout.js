import { Cairo } from 'next/font/google';
import './globals.css';

// استدعاء الخط العربي
const cairo = Cairo({ 
  subsets: ['arabic'],
  weight: ['400', '600', '700', '900'],
  variable: '--font-cairo'
});

export const metadata = {
  title: 'اكتشف سوف | الدليل السياحي',
  description: 'الدليل السياحي الشامل لولاية الوادي، مدينة الألف قبة وبوابة الصحراء الكبرى',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      {/* تطبيق الخط على كامل الموقع */}
      <body className={`${cairo.className} bg-[#fafafa] text-gray-800 antialiased`}>
        {children}
      </body>
    </html>
  );
}
