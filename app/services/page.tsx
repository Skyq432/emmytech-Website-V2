import CTA from '@/components/CTA';
import PageHero from '@/components/PageHero';
import ServiceCard from '@/components/ServiceCard';
import { services } from '@/lib/site-data';

export const metadata = { title: 'Services | Laptop Sales, Repairs, Solar & IT Support | Emmy Technology Nigeria' };

export default function ServicesPage() {
  return (
    <main>
      <PageHero
        eyebrow="Our Services"
        title="Reliable tech solutions for students, professionals & businesses in Nigeria."
        text="From genuine laptop sales and expert repairs to solar installations and IT support — Emmy Technology delivers practical, affordable technology services tailored to Nigeria's everyday needs."
        imageKey="repair"
        ctaLabel="Request a Service"
        ctaHref="/contact"
      />

      <section className="section-shell">
        <div className="section-heading">
          <span className="section-tag">What We Do</span>
          <h2>Technology services that actually work for you.</h2>
          <p>Professional support across devices, power solutions and business IT — all from one trusted team in Nigeria.</p>
        </div>
        <div className="service-grid">
          {services.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </section>

      <section className="section-shell soft-section full-bleed">
        <div className="section-heading">
          <span className="section-tag">Why Emmy Technology</span>
          <h2>Nigeria's most trusted local tech partner.</h2>
        </div>
        <div className="why-grid">
          <article className="why-card">
            <div className="why-icon">🛡️</div>
            <h3>Genuine Products Only</h3>
            <p>Every laptop, phone and accessory we sell is verified original. No clones, no fakes — just reliable tech that lasts.</p>
          </article>
          <article className="why-card">
            <div className="why-icon">⚡</div>
            <h3>Same-Day Repairs</h3>
            <p>Most screen replacements, battery swaps and software fixes completed within hours. Get back to work fast.</p>
          </article>
          <article className="why-card">
            <div className="why-icon">💰</div>
            <h3>Student-Friendly Pricing</h3>
            <p>We understand budgets. Whether you are a UI student or a startup founder, we offer fair prices with flexible payment options.</p>
          </article>
          <article className="why-card">
            <div className="why-icon">🌞</div>
            <h3>Solar That Works</h3>
            <p>From small home inverter setups to full office solar systems — we design, install and maintain power solutions for Nigeria's unreliable grid.</p>
          </article>
          <article className="why-card">
            <div className="why-icon">📍</div>
            <h3>Two Nigeria Locations</h3>
            <p>Visit us at University of Ibadan or Sango. Same quality service, same genuine products at both branches.</p>
          </article>
          <article className="why-card">
            <div className="why-icon">🤝</div>
            <h3>After-Sale Support</h3>
            <p>Our relationship does not end at purchase. We provide ongoing guidance, warranty support and troubleshooting whenever you need it.</p>
          </article>
        </div>
      </section>

      <section className="section-shell process-section">
        <div className="section-heading">
          <span className="section-tag">How It Works</span>
          <h2>Four simple steps to get what you need.</h2>
        </div>
        <div className="process-grid">
          {[
            ['1', 'Tell us what you need', 'Walk into any branch, call or message us. Describe your device issue, the laptop spec you want, or your solar power requirements.'],
            ['2', 'Get a clear recommendation', 'We assess your needs, explain your options and give you an honest price — no hidden charges, no pressure.'],
            ['3', 'Approve & we begin', 'Once you agree, we start immediately. Repairs, purchases, installations — handled by certified technicians.'],
            ['4', 'Receive & stay supported', 'Pick up your device or welcome our team for installation. We remain available for follow-up questions and warranty claims.'],
          ].map(([number, title, text]) => (
            <article className="process-card" key={number}>
              <span className="process-number">{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <CTA />
    </main>
  );
}