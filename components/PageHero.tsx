import Link from 'next/link';
import ImageSlot from './ImageSlot';

type PageHeroProps = {
  eyebrow: string;
  title: string;
  text: string;
  imageKey?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export default function PageHero({
  eyebrow,
  title,
  text,
  imageKey = 'hero',
  ctaLabel = 'Talk to Emmy Technology',
  ctaHref = '/contact'
}: PageHeroProps) {
  return (
    <section className="page-hero section-shell">
      <div className="page-hero-text">
        <span className="section-tag">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{text}</p>
        <Link className="btn primary" href={ctaHref}>{ctaLabel}</Link>
      </div>
      <div className="page-hero-visual">
        <ImageSlot imageKey={imageKey} height="lg" alt={title} />
      </div>
    </section>
  );
}