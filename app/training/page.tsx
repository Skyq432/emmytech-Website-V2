import Image from 'next/image';
import Link from 'next/link';
import { 
  Monitor, Wrench, Battery, Shield, AlertTriangle, 
  TrendingDown, Clock, Users, Building2, GraduationCap, 
  Landmark, Briefcase, ArrowLeft, ArrowRight, Calendar, 
  MapPin, Gamepad2, Play, ChevronRight, Sparkles,
  Target, Award, Zap, CheckCircle2, Phone, Mail,
  Star, ArrowUpRight, PlayCircle, X
} from 'lucide-react';
import './training.css';

const trainingTopics = [
  { icon: Monitor, text: 'Proper laptop and smartphone handling', detail: 'Learn correct posture, grip techniques, and safe transport practices to prevent physical damage.' },
  { icon: Wrench, text: 'Basic troubleshooting and problem prevention', detail: 'Identify common issues before they escalate and apply first-line fixes without calling IT.' },
  { icon: Battery, text: 'Battery care and charging best practices', detail: 'Maximize battery lifespan with optimal charging cycles and power management habits.' },
  { icon: Shield, text: 'Software safety and updates', detail: 'Keep systems secure with timely updates, patch management, and safe software installation.' },
  { icon: Shield, text: 'Data protection basics', detail: 'Understand backup protocols, encryption, and secure file handling to protect sensitive data.' },
  { icon: AlertTriangle, text: 'Common device mistakes to avoid', detail: 'Recognize risky behaviors like liquid exposure, overheating, and improper shutdowns.' },
];

const benefits = [
  { icon: TrendingDown, stat: '40%', title: 'Reduce Costs', text: 'Lower repair and replacement expenses through preventive care' },
  { icon: Clock, stat: '30%', title: 'Boost Productivity', text: 'Less downtime means more output from every team member' },
  { icon: Battery, stat: '2x', title: 'Extend Lifespan', text: 'Devices last twice as long with proper maintenance routines' },
  { icon: Wrench, stat: '60%', title: 'Fewer Disruptions', text: 'Drastically cut technical interruptions and support tickets' },
  { icon: Users, stat: '100%', title: 'Build Awareness', text: 'Every staff member becomes a guardian of company tech' },
];

const formats = [
  { icon: MapPin, title: 'On-Site', text: 'At your office or location' },
  { icon: Calendar, title: 'Flexible', text: 'Half-day or full-day sessions' },
  { icon: Play, title: 'Hands-On', text: 'Practical demonstrations' },
  { icon: Target, title: 'Custom', text: 'Tailored to your needs' },
  { icon: Gamepad2, title: 'Interactive', text: 'Games and team activities' },
];

const whoCanBook = [
  { icon: Building2, text: 'Corporate organizations' },
  { icon: GraduationCap, text: 'Schools & institutions' },
  { icon: Landmark, text: 'Government offices' },
  { icon: Briefcase, text: 'SMEs and startups' },
];

export default function TrainingPage() {
  return (
    <main className="tp-page">
      {/* ===== HERO ===== */}
      <section className="tp-hero">
        <div className="tp-hero-bg">
          <div className="tp-hero-orb tp-orb-1" />
          <div className="tp-hero-orb tp-orb-2" />
        </div>

        <div className="tp-hero-grid">
          <div className="tp-hero-content">
            <div className="tp-hero-badge">
              <Sparkles size={14} />
              <span>Corporate Training</span>
            </div>

            <h1>
              Device Maintenance
              <span className="tp-hero-accent">Training</span>
            </h1>

            <p className="tp-hero-subtitle">
              Empower your team to protect company technology, reduce costs, and eliminate downtime.
            </p>

            <div className="tp-hero-actions">
              <a href="#book" className="tp-btn tp-btn-primary">
                Book a Session <ArrowRight size={18} />
              </a>
              <Link href="/" className="tp-btn tp-btn-ghost">
                <ArrowLeft size={16} /> Back Home
              </Link>
            </div>

            <div className="tp-hero-stats">
              <div className="tp-stat">
                <strong>500+</strong>
                <span>Staff Trained</span>
              </div>
              <div className="tp-stat-divider" />
              <div className="tp-stat">
                <strong>50+</strong>
                <span>Organizations</span>
              </div>
              <div className="tp-stat-divider" />
              <div className="tp-stat">
                <strong>98%</strong>
                <span>Satisfaction</span>
              </div>
            </div>
          </div>

          <div className="tp-hero-visual">
            <div className="tp-hero-image-main">
              <Image
                src="/images/New-image/IT-Training1.png"
                alt="IT Training session at Emmy Technology"
                fill
                className="tp-hero-image"
                priority
              />
            </div>
            <div className="tp-hero-image-float">
              <Image
                src="/images/New-image/IT-Training2.png"
                alt="Hands-on device maintenance training"
                fill
                className="tp-hero-image"
              />
            </div>
            <div className="tp-hero-float-card">
              <div className="tp-float-card-icon">
                <Star size={16} fill="currentColor" />
              </div>
              <div className="tp-float-card-text">
                <strong>98%</strong>
                <span>Client Satisfaction</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TOPICS ===== */}
      <section className="tp-section tp-topics-section">
        <div className="tp-section-header">
          <span className="tp-tag">Curriculum</span>
          <h2>What Your Team Will Learn</h2>
          <p>Six essential modules designed for real-world application</p>
        </div>

        <div className="tp-topics-grid">
          {trainingTopics.map((topic, idx) => (
            <div key={idx} className="tp-topic-card" style={{ '--delay': `${idx * 0.1}s` } as React.CSSProperties}>
              <div className="tp-topic-header">
                <div className="tp-topic-icon-wrap">
                  <topic.icon size={22} strokeWidth={1.5} />
                </div>
                <span className="tp-topic-number">{String(idx + 1).padStart(2, '0')}</span>
              </div>
              <h3>{topic.text}</h3>
              <p>{topic.detail}</p>
              <div className="tp-topic-line" />
            </div>
          ))}
        </div>
      </section>

      {/* ===== BENEFITS ===== */}
      <section className="tp-section tp-benefits-section">
        <div className="tp-section-header">
          <span className="tp-tag">Impact</span>
          <h2>Measurable Results</h2>
          <p>Real outcomes organizations see after our training</p>
        </div>

        <div className="tp-benefits-grid">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="tp-benefit-card">
              <div className="tp-benefit-stat">{benefit.stat}</div>
              <div className="tp-benefit-icon">
                <benefit.icon size={22} strokeWidth={1.5} />
              </div>
              <h3>{benefit.title}</h3>
              <p>{benefit.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FORMATS ===== */}
      <section className="tp-section tp-formats-section">
        <div className="tp-section-header">
          <span className="tp-tag">Format</span>
          <h2>How We Deliver</h2>
          <p>Flexible options that fit your schedule</p>
        </div>

        <div className="tp-formats-grid">
          {formats.map((format, idx) => (
            <div key={idx} className="tp-format-card">
              <div className="tp-format-icon">
                <format.icon size={24} strokeWidth={1.5} />
              </div>
              <h3>{format.title}</h3>
              <p>{format.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== WHO CAN BOOK ===== */}
      <section className="tp-section tp-who-section">
        <div className="tp-who-container">
          <div className="tp-who-content">
            <div className="tp-who-text">
              <span className="tp-tag tp-tag-light">Who It&apos;s For</span>
              <h2>Organizations Ready to Invest in Their Teams</h2>
              <p>From government agencies to fast-growing startups, we adapt our training to your culture and needs.</p>
            </div>
            <div className="tp-who-grid">
              {whoCanBook.map((item, idx) => (
                <div key={idx} className="tp-who-card">
                  <div className="tp-who-icon-wrap">
                    <item.icon size={24} strokeWidth={1.5} />
                  </div>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="tp-who-image">
            <Image
              src="/images/New-image/IT-Training2.png"
              alt="Team training session"
              fill
              className="tp-who-img"
            />
            <div className="tp-who-image-overlay" />
          </div>
        </div>
      </section>

      {/* ===== BOOKING FORM ===== */}
      <section id="book" className="tp-section tp-book-section">
        <div className="tp-book-panel">
          <div className="tp-book-left">
            <span className="tp-tag">Get Started</span>
            <h2>Book Your Session</h2>
            <p>Fill out the form and our team will contact you within 24 hours.</p>

            <div className="tp-book-features">
              <div className="tp-book-feature">
                <div className="tp-book-feature-icon"><Zap size={16} /></div>
                <span>Free consultation call included</span>
              </div>
              <div className="tp-book-feature">
                <div className="tp-book-feature-icon"><Calendar size={16} /></div>
                <span>Flexible scheduling</span>
              </div>
              <div className="tp-book-feature">
                <div className="tp-book-feature-icon"><Award size={16} /></div>
                <span>Certificate for all participants</span>
              </div>
            </div>

            <div className="tp-book-contact">
              <a href="tel:+234" className="tp-book-contact-item">
                <Phone size={16} />
                <span>Call us directly</span>
              </a>
              <a href="mailto:info@emmytechnology.com" className="tp-book-contact-item">
                <Mail size={16} />
                <span>info@emmytechnology.com</span>
              </a>
            </div>
          </div>

          <form className="tp-book-form">
            <div className="tp-form-row">
              <div className="tp-form-group">
                <label>Company Name</label>
                <input type="text" placeholder="Acme Corp" />
              </div>
              <div className="tp-form-group">
                <label>Contact Person</label>
                <input type="text" placeholder="John Doe" />
              </div>
            </div>

            <div className="tp-form-row">
              <div className="tp-form-group">
                <label>Phone Number</label>
                <input type="tel" placeholder="+234 800 000 0000" />
              </div>
              <div className="tp-form-group">
                <label>Email</label>
                <input type="email" placeholder="john@company.com" />
              </div>
            </div>

            <div className="tp-form-row">
              <div className="tp-form-group">
                <label>Number of Staff</label>
                <input type="number" placeholder="25" />
              </div>
              <div className="tp-form-group">
                <label>Preferred Date</label>
                <input type="date" />
              </div>
            </div>

            <div className="tp-form-group">
              <label>Location / Address</label>
              <input type="text" placeholder="Your office location in Nigeria" />
            </div>

            <button type="submit" className="tp-btn tp-btn-primary tp-btn-full">
              Submit Request <ArrowRight size={18} />
            </button>

            <p className="tp-form-note">
              <CheckCircle2 size={14} /> We respond within 24 hours
            </p>
          </form>
        </div>
      </section>

      {/* ===== CLOSING CTA ===== */}
      <section className="tp-closing">
        <div className="tp-closing-bg">
          <div className="tp-closing-orb" />
        </div>
        <div className="tp-closing-content">
          <h2>Let&apos;s Help Your Team Work Smarter</h2>
          <p>We don&apos;t just train — we empower your staff to protect your company&apos;s technology investment.</p>
          <div className="tp-closing-brand">
            <span className="tp-closing-logo">Emmy Technology</span>
            <span className="tp-closing-divider" />
            <span>Practical Tech Training for Productive Teams</span>
          </div>
        </div>
      </section>
    </main>
  );
}