import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Emmy Technology | Laptops, Repairs, Solar & IT Support in Ibadan',
  description: 'Emmy Technology provides laptops, smartphones, accessories, repairs, solar installation and IT support from University of Ibadan and Sango, Ibadan.',
  keywords: ['Emmy Technology', 'laptops Ibadan', 'phone repairs Ibadan', 'solar installation', 'IT support Nigeria', 'tech shop UI', 'gadgets Ibadan'],
  authors: [{ name: 'Emmy Technology' }],
  openGraph: {
    title: 'Emmy Technology | Laptops, Repairs, Solar & IT Support in Ibadan',
    description: 'Genuine products, expert repairs, and solar solutions in Ibadan.',
    type: 'website',
    locale: 'en_NG',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Emmy Technology',
    description: 'Technology you can trust. Solutions you can depend on.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <div className="page-wrapper">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}