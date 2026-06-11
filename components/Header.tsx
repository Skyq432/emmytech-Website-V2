import Image from 'next/image';
import Link from 'next/link';
import { Menu, Phone, MessageCircle } from 'lucide-react';
import { brand, navLinks } from '@/lib/site-data';

export default function Header() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Emmy Technology home">
        <Image src="/images/emmy-logo-blue-text.png" alt="Emmy Technology" width={200} height={60} priority />
      </Link>

      <nav className="desktop-nav" aria-label="Primary navigation">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href}>{link.label}</Link>
        ))}
      </nav>

      <div className="header-actions">
        <a className="header-cta" href={`tel:${brand.phone}`}>
          <Phone size={16} />
          Call Now
        </a>
        <a className="header-cta-whatsapp" href={brand.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
          <MessageCircle size={18} />
        </a>
      </div>

      <details className="mobile-menu">
        <summary aria-label="Open menu"><Menu size={24} /></summary>
        <div className="mobile-menu-panel">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>{link.label}</Link>
          ))}
          <a href={brand.whatsapp}>WhatsApp Emmy Technology</a>
          <a href={`tel:${brand.phone}`}>Call {brand.phoneDisplay}</a>
        </div>
      </details>
    </header>
  );
}