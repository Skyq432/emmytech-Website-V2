import Link from 'next/link';
import { MessageCircle, MapPin } from 'lucide-react';
import { brand } from '@/lib/site-data';

export default function CTA() {
  return (
    <section className="section-shell">
      <div className="cta-premium">
        <div className="cta-premium-inner">
          <div>
            <span className="cta-eyebrow">Need help choosing?</span>
            <h2>Speak with Emmy Technology before you buy, repair or install.</h2>
            <p>Get clear advice, current pricing and the best next step for your device, office, hostel or business.</p>
          </div>
          <div className="cta-actions">
            <a className="btn-gold" href={brand.whatsapp} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={18} />
              Chat on WhatsApp
            </a>
            <Link className="btn-glass" href="/contact">
              <MapPin size={18} />
              Visit Our Branches
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}