import CTA from '@/components/CTA';
import ImageSlot from '@/components/ImageSlot';
import PageHero from '@/components/PageHero';
import { brand } from '@/lib/site-data';

export const metadata = { title: 'Campus Ambassador Program | Emmy Technology' };

const ambassadorTiers = [
  {
    tier: 'Bronze',
    title: 'Campus Rep',
    points: '0-500',
    rewards: ['Branded T-shirt & stickers', '5% commission on referrals', 'Certificate of participation'],
    icon: '🥉'
  },
  {
    tier: 'Silver',
    title: 'Campus Lead',
    points: '500-1,200',
    rewards: ['All Bronze perks +', '10% commission on referrals', 'Priority repair discounts', 'LinkedIn recommendation'],
    icon: '🥈'
  },
  {
    tier: 'Gold',
    title: 'Campus Champion',
    points: '1,200+',
    rewards: ['All Silver perks +', '15% commission on referrals', 'Free device accessories monthly', 'Internship opportunity', 'Featured on Emmy socials'],
    icon: '🥇'
  }
];

const ambassadorRequirements = [
  'Currently enrolled in a tertiary institution in Ibadan or surrounding areas',
  'Active on campus with strong network among students and student organizations',
  'Genuine interest in technology, gadgets, and digital solutions',
  'Available to dedicate 5-10 hours weekly to ambassador activities',
  'Active social media presence with engaged followers',
  'Self-motivated with excellent communication and interpersonal skills'
];

const ambassadorActivities = [
  {
    title: 'Campus Outreach',
    desc: 'Organize awareness drives, demo days, and tech talks in hostels, cafeterias, and faculty blocks.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    )
  },
  {
    title: 'Social Promotion',
    desc: 'Create engaging content about Emmy Technology products, repair services, and offers on your social channels.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
      </svg>
    )
  },
  {
    title: 'Referral Sales',
    desc: 'Drive product sales and repair bookings through your unique referral code or link.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
      </svg>
    )
  },
  {
    title: 'Feedback & Insights',
    desc: 'Gather student feedback on tech needs and share market insights with the Emmy team.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
    )
  }
];

const faqs = [
  {
    q: 'Is this program open to all students?',
    a: 'Yes! We welcome students from all faculties and levels — undergraduate, postgraduate, and part-time — as long as you are enrolled in an accredited institution in Ibadan or nearby cities.'
  },
  {
    q: 'How do I earn points?',
    a: 'You earn points through successful referrals, social media engagement, event participation, and completing monthly challenges. Each activity has a clear point value shared in the ambassador dashboard.'
  },
  {
    q: 'Do I need to pay anything to join?',
    a: 'Absolutely not. The program is completely free. We provide all marketing materials and training at no cost to you.'
  },
  {
    q: 'How long is the ambassador term?',
    a: 'Each term runs for one academic semester, with the option to renew based on performance. Top performers may be invited to join as year-long ambassadors.'
  }
];

export default function AmbassadorPage() {
  return (
    <main>
      {/* Hero Section */}
      <PageHero
        eyebrow="Campus Ambassador Program"
        title="Become an Emmy Technology Ambassador"
        text="Join a growing network of student leaders connecting campus communities with quality technology products, repair support, and exclusive offers. Turn your influence into income and experience."
        ctaLabel="Apply on WhatsApp"
        ctaHref={brand.whatsapp}
      />

      {/* Who We're Looking For + Stats */}
      <section className="section-shell about-hero-unique">
        <div className="about-hero-unique-inner">
          <div className="about-hero-unique-text">
            <span className="section-tag">For Student Leaders</span>
            <h1>Represent a trusted technology brand on campus.</h1>
            <p>
              The Campus Ambassador Program is designed for students who are passionate about technology, 
              leadership, and making an impact. Ambassadors help fellow students discover the right gadgets, 
              access trusted repairs, and benefit from exclusive student pricing.
            </p>
            <div className="about-hero-unique-stats">
              <div className="stat-block">
                <strong>₦50K+</strong>
                <span>Monthly top earnings</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-block">
                <strong>500+</strong>
                <span>Active ambassadors</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-block">
                <strong>15+</strong>
                <span>Partner campuses</span>
              </div>
            </div>
          </div>
          <div className="about-hero-unique-visual">
            <div className="hero-image-main">
              <img 
                src="/images/Ambassador-page/1.png" 
                alt="Emmy Technology campus ambassador leading a student tech awareness event"
                className="hero-img-primary"
              />
            </div>
            <div className="hero-image-float">
              <img 
                src="/images/Ambassador-page/2.jpg" 
                alt="Ambassador distributing branded materials during campus outreach"
                className="hero-img-secondary"
              />
            </div>
            <div className="hero-badge-float">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Verified Campus Partner
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Do */}
      <section className="section-shell soft-section full-bleed">
        <div className="section-heading">
          <span className="section-tag gold">Your Role</span>
          <h2>What ambassadors do.</h2>
          <p className="section-subtitle">
            As an Emmy Technology ambassador, you are the bridge between quality tech solutions and your campus community.
          </p>
        </div>
        <div className="service-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          {ambassadorActivities.map((activity, idx) => (
            <div key={idx} className="service-card" style={{ padding: '32px' }}>
              <div className="icon-wrap" style={{ margin: '-26px 0 20px 0' }}>
                {activity.icon}
              </div>
              <h3>{activity.title}</h3>
              <p style={{ color: 'var(--muted)', lineHeight: '1.7', fontSize: '0.95rem' }}>
                {activity.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Tiered Rewards */}
      <section className="section-shell">
        <div className="section-heading">
          <span className="section-tag">Rewards</span>
          <h2>Progressive reward tiers.</h2>
          <p className="section-subtitle">
            The more you engage, the more you earn. Climb through tiers to unlock bigger benefits and exclusive opportunities.
          </p>
        </div>
        <div className="mission-grid">
          {ambassadorTiers.map((tier) => (
            <div key={tier.tier} className="mission-card" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ 
                position: 'absolute', 
                top: '20px', 
                right: '20px', 
                fontSize: '2.5rem',
                opacity: '0.15'
              }}>
                {tier.icon}
              </div>
              <div className="mission-icon">
                <span style={{ fontSize: '1.5rem' }}>{tier.icon}</span>
              </div>
              <h3>{tier.tier} — {tier.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600', marginBottom: '16px' }}>
                {tier.points} points
              </p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {tier.rewards.map((reward, idx) => (
                  <li key={idx} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    fontSize: '0.92rem', 
                    color: '#4a5568' 
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    {reward}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Requirements */}
      <section className="section-shell soft-section full-bleed">
        <div className="story-layout" style={{ alignItems: 'center' }}>
          <div>
            <span className="section-tag">Requirements</span>
            <h2>Who can apply?</h2>
            <p style={{ marginBottom: '28px' }}>
              We are looking for enthusiastic, well-connected students who want to build real-world experience while earning.
            </p>
            <div className="why-list">
              {ambassadorRequirements.map((req, idx) => (
                <div key={idx} className="why-list-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <div>
                    <span>{req}</span>
                  </div>
                </div>
              ))}
            </div>
            <a 
              href={brand.whatsapp} 
              className="btn primary" 
              style={{ marginTop: '32px', display: 'inline-flex' }}
            >
              Apply Now
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>
          <div className="why-image">
            <img 
              src="/images/Ambassador-page/3.png" 
              alt="Diverse group of Emmy Technology student ambassadors collaborating"
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover', 
                borderRadius: 'var(--radius-lg)',
                minHeight: '520px'
              }}
            />
          </div>
        </div>
      </section>

      {/* How to Apply / Process */}
      <section className="section-shell">
        <div className="section-heading">
          <span className="section-tag">How It Works</span>
          <h2>Application process.</h2>
        </div>
        <div className="process-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[
            { step: '1', title: 'Apply', desc: 'Send us a message on WhatsApp with your name, school, and why you want to join.' },
            { step: '2', title: 'Interview', desc: 'Short virtual chat with our team to understand your goals and campus network.' },
            { step: '3', title: 'Onboard', desc: 'Get your ambassador kit, referral code, and access to the private group.' },
            { step: '4', title: 'Launch', desc: 'Start earning points, commissions, and building your portfolio immediately.' }
          ].map((item) => (
            <article key={item.step} style={{ textAlign: 'center', padding: '32px 24px' }}>
              <span style={{ 
                width: '56px', 
                height: '56px', 
                display: 'grid', 
                placeItems: 'center', 
                borderRadius: '999px', 
                background: 'var(--secondary)', 
                color: 'var(--ink)', 
                fontWeight: '800', 
                fontSize: '1.25rem', 
                margin: '0 auto 20px',
                boxShadow: '0 6px 16px rgba(255, 177, 0, 0.25)'
              }}>
                {item.step}
              </span>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '10px' }}>{item.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: '1.6', margin: 0 }}>
                {item.desc}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Gallery / Social Proof Section */}
      <section className="section-shell soft-section full-bleed">
        <div className="section-heading">
          <span className="section-tag">Community</span>
          <h2>Ambassador moments.</h2>
          <p className="section-subtitle">
            Real students, real impact, real rewards. See what our ambassador community looks like across campuses.
          </p>
        </div>
        <div className="portfolio-mini-grid">
          <div className="image-slot" style={{ minHeight: '280px', borderRadius: 'var(--radius)' }}>
            <img 
              src="/images/Ambassador-page/4.jpg" 
              alt="Campus ambassador event with students exploring Emmy Technology products"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius)' }}
            />
          </div>
          <div className="image-slot" style={{ minHeight: '280px', borderRadius: 'var(--radius)' }}>
            <img 
              src="/images/Ambassador-page/1.png" 
              alt="Ambassador team photo during training session"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius)' }}
            />
          </div>
          <div className="image-slot" style={{ minHeight: '280px', borderRadius: 'var(--radius)' }}>
            <img 
              src="/images/Ambassador-page/2.jpg" 
              alt="Students receiving tech recommendations from ambassador"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius)' }}
            />
          </div>
          <div className="image-slot" style={{ minHeight: '280px', borderRadius: 'var(--radius)' }}>
            <img 
              src="/images/Ambassador-page/3.png" 
              alt="Ambassador celebrating monthly achievement milestone"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius)' }}
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-shell">
        <div className="section-heading">
          <span className="section-tag">FAQ</span>
          <h2>Common questions.</h2>
        </div>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {faqs.map((faq, idx) => (
            <details 
              key={idx} 
              style={{ 
                background: 'white', 
                borderRadius: '16px', 
                border: '1px solid #e8ecf5', 
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <summary style={{ 
                padding: '24px 28px', 
                fontWeight: '600', 
                color: 'var(--ink)', 
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                listStyle: 'none'
              }}>
                {faq.q}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginLeft: '16px' }}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </summary>
              <div style={{ padding: '0 28px 24px', color: 'var(--muted)', lineHeight: '1.7', fontSize: '0.95rem' }}>
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-shell">
        <div className="cta-premium">
          <div className="cta-premium-inner">
            <div>
              <div className="cta-eyebrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                Limited Spots Per Campus
              </div>
              <h2>Ready to lead your campus?</h2>
              <p>
                Applications are reviewed on a rolling basis. Secure your spot today and start building your tech career while still in school.
              </p>
            </div>
            <div className="cta-actions">
              <a href={brand.whatsapp} className="btn-gold">
                Apply on WhatsApp
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </a>
              <a href={`mailto:${brand.email || 'info@emmytechnology.com'}`} className="btn-glass">
                Email Us Instead
              </a>
            </div>
          </div>
        </div>
      </section>

      <CTA />
    </main>
  );
}