import Image from 'next/image';
import Link from 'next/link';
import { 
  ShieldCheck, Star, MapPin, ArrowRight, Monitor, Smartphone, 
  Headphones, Sun, Zap, Truck, Clock, Wrench, Phone, CheckCircle2
} from 'lucide-react';
import CTA from '@/components/CTA';
import ImageSlot from '@/components/ImageSlot';
import ServiceCard from '@/components/ServiceCard';
import { brand, portfolioItems, productHighlights, services, testimonials, values } from '@/lib/site-data';

export default function Home() {
  return (
    <main>
      {/* ===== HERO ===== */}
      <section className="hero-crescendo-wrapper section-shell">
        <div className="hero-crescendo-card">
          <div className="hero-crescendo-text">
            <span className="eyebrow-light">
              <ShieldCheck size={14} />
              Genuine Products • Expert Repairs • Solar Solutions
            </span>
            <h1>Technology you can trust. Solutions you can depend on.</h1>
            <p>Emmy Technology helps students, professionals, homes and businesses in Ibadan buy the right devices, get expert repairs, and stay powered with reliable solar and IT support.</p>
            <div className="hero-actions">
              <Link className="btn primary-light" href="/products">Shop Products</Link>
              <a className="btn secondary" href={brand.whatsapp} target="_blank" rel="noopener noreferrer">Book a Repair</a>
            </div>
          </div>
          <div className="hero-crescendo-image">
            <Image 
              src="/images/emmytech hero pic.png" 
              alt="Emmy Technology showroom with laptops and devices" 
              width={600} 
              height={700} 
              className="crescendo-image" 
              priority 
            />
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="section-shell">
        <div className="section-header-row">
          <div>
            <span className="section-tag">Featured Products</span>
            <h2>Top picks from our collection</h2>
          </div>
          <Link className="btn light" href="/products">See All Products <ArrowRight size={16} /></Link>
        </div>
        <p className="section-subtitle">Handpicked devices and accessories with verified specs, warranty coverage, and competitive pricing for every budget.</p>

        <div className="product-grid">
          {productHighlights.map((product) => (
            <article className="product-card" key={product.name}>
              <ImageSlot 
                imageKey={product.imageKey} 
                height="sm" 
                alt={product.name}
              />
              <span className="product-category">{product.category}</span>
              <h3>{product.name}</h3>
              <p className="product-note">{product.note}</p>
              <strong className="product-price">{product.price}</strong>
            </article>
          ))}
        </div>
      </section>

      {/* ===== SHOP BY CATEGORY ===== */}
      <section className="section-shell soft-section full-bleed">
        <div className="section-header-row">
          <div>
            <span className="section-tag">Shop By Category</span>
            <h2>Browse by what you need</h2>
          </div>
        </div>

        <div className="category-grid">
          <Link href="/products/laptops" className="category-card">
            <div className="category-icon"><Monitor size={24} /></div>
            <div className="category-content">
              <strong>Laptops</strong>
              <span>Business, student & gaming laptops from trusted brands</span>
            </div>
            <ArrowRight size={18} className="category-arrow" />
          </Link>

          <Link href="/products/phones" className="category-card">
            <div className="category-icon"><Smartphone size={24} /></div>
            <div className="category-content">
              <strong>Smartphones</strong>
              <span>Latest Android and iOS devices with warranty</span>
            </div>
            <ArrowRight size={18} className="category-arrow" />
          </Link>

          <Link href="/products/accessories" className="category-card">
            <div className="category-icon"><Headphones size={24} /></div>
            <div className="category-content">
              <strong>Accessories</strong>
              <span>Chargers, cases, cables, earbuds and more</span>
            </div>
            <ArrowRight size={18} className="category-arrow" />
          </Link>

          <Link href="/products/solar" className="category-card">
            <div className="category-icon"><Sun size={24} /></div>
            <div className="category-content">
              <strong>Solar & Power</strong>
              <span>Inverters, panels, batteries and installation kits</span>
            </div>
            <ArrowRight size={18} className="category-arrow" />
          </Link>
        </div>
      </section>

      {/* ===== TRUST BANNER ===== */}
      <section className="section-shell">
        <div className="trust-banner-card">
          <h2>Experience Streamlined Shopping With Emmy Technology</h2>
          <div className="trust-grid">
            <div className="trust-item">
              <Truck size={28} strokeWidth={1.5} />
              <strong>Fast Delivery</strong>
              <span>Same-day delivery across Ibadan and nearby areas</span>
            </div>
            <div className="trust-item">
              <MapPin size={28} strokeWidth={1.5} />
              <strong>Two Locations</strong>
              <span>Visit us at UI Campus or Sango for pickup and support</span>
            </div>
            <div className="trust-item">
              <ShieldCheck size={28} strokeWidth={1.5} />
              <strong>Genuine Warranty</strong>
              <span>All products backed by manufacturer warranty</span>
            </div>
          </div>
          <div className="center-action">
            <Link className="btn primary" href="/products">Shop Now</Link>
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE US - WITH YOUR TEAM PHOTO ===== */}
      <section className="section-shell why-section">
        <div className="why-layout">
          <div className="why-image">
            <ImageSlot 
              src="/images/image1.png" 
              height="lg" 
              alt="Emmy Technology team"
            />
          </div>
          <div className="why-content">
            <span className="section-tag">Why Choose Us</span>
            <h2>Clear advice. Genuine products. Fast support.</h2>
            <div className="why-list">
              {values.map(({ title, text, icon: Icon }) => (
                <div className="why-list-item" key={title}>
                  <Icon size={22} strokeWidth={1.5} />
                  <div>
                    <strong>{title}</strong>
                    <span>{text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section className="section-shell soft-section full-bleed">
        <div className="section-heading">
          <span className="section-tag">Services</span>
          <h2>Everything from device purchase to repair and power support</h2>
        </div>
        <div className="service-grid">
          {services.slice(0, 3).map((service) => <ServiceCard key={service.slug} service={service} />)}
        </div>
        <div className="center-action">
          <Link className="btn light" href="/services">Explore all services <ArrowRight size={16} /></Link>
        </div>
      </section>

          {/* ===== PORTFOLIO PREVIEW ===== */}
      <section className="section-shell dark-section full-bleed portfolio-preview">
        <div>
          <span className="section-tag gold">Portfolio</span>
          <h2>See what we have built and delivered</h2>
          <p>From campus tech awareness programs to solar installations and corporate device setups, explore projects that showcase our commitment to quality.</p>
          <Link className="btn secondary" href="/portfolio">View portfolio</Link>
        </div>
        <div className="portfolio-mini-grid">
          {['/images/New-image/1.png', '/images/New-image/2.png', '/images/New-image/3.png', '/images/New-image/4.png'].map((src, idx) => (
            <ImageSlot
              key={idx}
              src={src}
              height="sm"
              alt={portfolioItems[idx]?.title}
            />
          ))}
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="section-shell testimonials">
        <div className="section-heading">
          <span className="section-tag">Customer Voice</span>
          <h2>What our customers say</h2>
        </div>
        <div className="testimonial-grid">
          {testimonials.map((quote, idx) => (
            <blockquote key={idx}>
              <p>&ldquo;{quote}&rdquo;</p>
            </blockquote>
          ))}
        </div>
      </section>

      <CTA />
    </main>
  );
}