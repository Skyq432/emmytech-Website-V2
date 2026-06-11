import Image from 'next/image';
import Link from 'next/link';
import { Phone, Mail, Clock, MapPin } from 'lucide-react';
import { brand, navLinks } from '@/lib/site-data';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Image src="\images\emmy-logo-blue-text.png" alt="Emmy Technology" width={200} height={60} />
          <p>{brand.tagline}</p>
          <p className="footer-motto">Trusted Products. Professional Service. Lasting Solutions.</p>
        </div>
        <div className="footer-links">
          <strong>Quick Links</strong>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
        <div className="footer-contact">
          <strong>Contact</strong>
          <a href={`tel:${brand.phone}`}>
            <Phone size={15} />
            {brand.phoneDisplay}
          </a>
          <a href={`mailto:${brand.email}`}>
            <Mail size={15} />
            {brand.email}
          </a>
          <span>
            <MapPin size={15} />
            UI Campus & Sango, Ibadan
          </span>
          <span>
            <Clock size={15} />
            {brand.hours}
          </span>
        </div>
      </div>
      <div className="footer-bottom">
        <span>&copy; {new Date().getFullYear()} Emmy Technology. All rights reserved.</span>
        <span>Designed with precision in Ibadan, Nigeria.</span>
      </div>
    </footer>
  );
}
