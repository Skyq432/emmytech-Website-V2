import Link from 'next/link';
import ImageSlot from './ImageSlot';
import { services } from '@/lib/site-data';
import { ArrowRight } from 'lucide-react';

type Service = (typeof services)[number];

export default function ServiceCard({ service }: { service: Service }) {
  const Icon = service.icon;
  return (
    <article className="service-card pro-card">
      <ImageSlot imageKey={service.imageKey} height="sm" alt={service.title} />
      <div className="icon-wrap"><Icon size={24} /></div>
      <h3>{service.title}</h3>
      <p>{service.text}</p>
      <ul>
        {service.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
      </ul>
      <Link className="text-link" href="/contact">
        Request service
        <ArrowRight size={14} />
      </Link>
    </article>
  );
}