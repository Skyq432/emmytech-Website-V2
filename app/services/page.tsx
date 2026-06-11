import CTA from '@/components/CTA';
import PageHero from '@/components/PageHero';
import ServiceCard from '@/components/ServiceCard';
import ImageSlot from '@/components/ImageSlot';
import { services } from '@/lib/site-data';

export const metadata = { title: 'Services | Laptop Sales, Repairs, Solar & IT Support | Emmy Technology Ibadan' };

export default function ServicesPage() {
  return (
    <main>
      <PageHero
        eyebrow="Our Services"
        title="Reliable tech solutions for students, professionals & businesses in Ibadan."
        text="From genuine laptop sales and expert repairs to solar installations and IT support — Emmy Technology delivers practical, affordable technology services tailored to Nigeria's everyday needs."
        imageKey="repair"
        ctaLabel="Request a Service"
        ctaHref="/contact"
      />

      {/* ===== SERVICES GRID ===== */}
      <section className="section-shell">
        <div className="section-heading">
          <span className="section-tag">What We Do</span>
          <h2>Technology services that actually work for you.</h2>
          <p>Professional support across devices, power solutions and business IT — all from one trusted team in Ibadan.</p>
        </div>
        <div className="service-grid">
          {services.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="section-shell soft-section full-bleed">
        <div className="section-heading">
          <span className="section-tag">Why Emmy Technology</span>
          <h2>Ibadan's most trusted local tech partner.</h2>
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
            <h3>Two Ibadan Locations</h3>
            <p>Visit us at University of Ibadan or Sango. Same quality service, same genuine products at both branches.</p>
          </article>
          <article className="why-card">
            <div className="why-icon">🤝</div>
            <h3>After-Sale Support</h3>
            <p>Our relationship does not end at purchase. We provide ongoing guidance, warranty support and troubleshooting whenever you need it.</p>
          </article>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
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

      {/* ===== SERVICE DETAILS WITH IMAGES ===== */}
      <section className="section-shell service-details-section">
        <div className="section-heading">
          <span className="section-tag">Detailed Services</span>
          <h2>Everything we handle, explained.</h2>
        </div>
        <div className="service-details-grid">
          <article className="service-detail-card">
            <div className="service-detail-image">
              <ImageSlot imageKey="laptop" height="md" alt="Genuine laptop sales at Emmy Technology Ibadan" />
            </div>
            <div className="service-detail-content">
              <h3>Laptop & Computer Sales</h3>
              <p>We stock genuine HP, Dell, Lenovo, Acer and Apple laptops — from budget-friendly student models to high-performance business machines. Every device is tested, verified and backed by warranty. Need help choosing? We recommend based on your course, work or budget.</p>
              <ul>
                <li>New and certified refurbished laptops</li>
                <li>Student discounts available</li>
                <li>Software installation & setup included</li>
                <li>Warranty on every purchase</li>
              </ul>
            </div>
          </article>

          <article className="service-detail-card">
            <div className="service-detail-image">
              <ImageSlot imageKey="phone" height="md" alt="Professional phone repair at Emmy Technology" />
            </div>
            <div className="service-detail-content">
              <h3>Phone & Tablet Repair</h3>
              <p>Cracked screen? Battery dying fast? Water damage? Our technicians repair iPhone, Samsung, Tecno, Infinix, Xiaomi and more. We use quality replacement parts and test every device before handover.</p>
              <ul>
                <li>Screen & battery replacement</li>
                <li>Charging port & speaker repair</li>
                <li>Software flashing & unlocking</li>
                <li>Water damage recovery</li>
              </ul>
            </div>
          </article>

          <article className="service-detail-card">
            <div className="service-detail-image">
              <ImageSlot imageKey="repair" height="md" alt="Expert laptop repair in Ibadan" />
            </div>
            <div className="service-detail-content">
              <h3>Laptop & Computer Repair</h3>
              <p>From motherboard-level repairs to keyboard replacements and OS upgrades, we fix what others say is unfixable. Bring your dead laptop back to life at a fraction of replacement cost.</p>
              <ul>
                <li>Motherboard & power jack repair</li>
                <li>Screen, keyboard & hinge replacement</li>
                <li>Virus removal & OS reinstallation</li>
                <li>Data recovery & backup solutions</li>
              </ul>
            </div>
          </article>

          <article className="service-detail-card">
            <div className="service-detail-image">
              <ImageSlot imageKey="solar" height="md" alt="Solar installation services in Nigeria" />
            </div>
            <div className="service-detail-content">
              <h3>Solar & Inverter Installation</h3>
              <p>Stop relying on generators. We design and install solar power systems for homes, hostels, offices and shops across Ibadan. From small 1kVA setups to full office systems — we size, supply, install and maintain.</p>
              <ul>
                <li>Home & office solar systems</li>
                <li>Inverter & battery installation</li>
                <li>Energy audit & system sizing</li>
                <li>Maintenance & troubleshooting</li>
              </ul>
            </div>
          </article>

          <article className="service-detail-card">
            <div className="service-detail-image">
              <ImageSlot imageKey="network" height="md" alt="IT consulting and networking in Nigeria" />
            </div>
            <div className="service-detail-content">
              <h3>IT Support & Consulting</h3>
              <p>Setting up a new office? Need reliable Wi-Fi for your hostel or business? We handle network installation, computer setup, printer configuration and ongoing IT support for small businesses in Ibadan.</p>
              <ul>
                <li>Office network & Wi-Fi setup</li>
                <li>Computer & printer configuration</li>
                <li>CCTV installation & support</li>
                <li>Remote & on-site IT troubleshooting</li>
              </ul>
            </div>
          </article>

          <article className="service-detail-card">
            <div className="service-detail-image">
              <ImageSlot imageKey="accessories" height="md" alt="Tech accessories available at Emmy Technology" />
            </div>
            <div className="service-detail-content">
              <h3>Tech Accessories & Peripherals</h3>
              <p>Chargers, cables, mice, keyboards, external drives, laptop bags, screen protectors and more. We stock only durable, tested accessories — no cheap knockoffs that fail in two weeks.</p>
              <ul>
                <li>Original chargers & cables</li>
                <li>External hard drives & USB drives</li>
                <li>Laptop bags, stands & cooling pads</li>
                <li>Screen protectors & cases</li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      <CTA />
    </main>
  );
}