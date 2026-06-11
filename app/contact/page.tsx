"use client";

import { useState } from 'react';
import {
  Mail,
  MapPin,
  Phone,
  Send,
  Clock,
  ExternalLink,
  MessageCircle,
  CheckCircle,
  Loader2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import CTA from '@/components/CTA';
import { brand } from '@/lib/site-data';

// ==================== SOCIAL LINKS ====================
const socialLinks = [
  {
    name: 'TikTok',
    handle: '@emmytechnology',
    url: 'https://www.tiktok.com/@emmytechnology?_r=1&_t=ZS-973604l2wBY',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.89 2.89 2.89 0 0 1 2.88-2.88c.18 0 .35.02.52.04V9.66a6.23 6.23 0 0 0-.52-.03A6.34 6.34 0 0 0 3.24 16a6.34 6.34 0 0 0 6.33 6.33 6.34 6.34 0 0 0 6.33-6.33V9.02a8.16 8.16 0 0 0 4.77 1.53V7.19a4.85 4.85 0 0 1-1.08-.5z" />
      </svg>
    ),
    color: '#000000',
    bg: '#f1f1f1',
  },
  {
    name: 'Instagram',
    handle: '@emmy_technology',
    url: 'https://www.instagram.com/emmy_technology?igsh=MXRnbDNvMXEza21xZg==',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
    color: '#E4405F',
    bg: '#fdf2f4',
  },
  {
    name: 'Facebook',
    handle: 'Emmy Technology',
    url: 'https://www.facebook.com/profile.php?id=100083391098539',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
    color: '#1877F2',
    bg: '#eef4fd',
  },
  {
    name: 'X (Twitter)',
    handle: '@Emmytech25',
    url: 'https://x.com/Emmytech25',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    color: '#000000',
    bg: '#f1f1f1',
  },
];

// ==================== FORM COMPONENT ====================
function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    need: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', phone: '', email: '', need: '', message: '' });
    }, 3000);
  };

  if (isSubmitted) {
    return (
      <div className="contact-form-success">
        <div className="contact-form-success-icon">
          <CheckCircle size={32} />
        </div>
        <h3>Message Sent!</h3>
        <p>Thank you for reaching out. We will get back to you within 24 hours.</p>
      </div>
    );
  }

  const inputBaseStyle: React.CSSProperties = {
    width: '100%',
    border: '1.5px solid #e2e8f0',
    borderRadius: '14px',
    padding: '14px 16px',
    font: 'inherit',
    color: 'var(--ink)',
    background: 'white',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 600,
    color: 'var(--ink)',
    marginBottom: '8px',
    letterSpacing: '0.02em',
  };

  return (
    <form onSubmit={handleSubmit} className="contact-form-card">
      <div className="form-grid-two">
        <div>
          <label style={labelStyle}>Full Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
            style={inputBaseStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(3, 36, 137, 0.06)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>
        <div>
          <label style={labelStyle}>Phone / WhatsApp</label>
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+234 800 000 0000"
            required
            style={inputBaseStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(3, 36, 137, 0.06)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Email Address</label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="john@example.com"
          style={inputBaseStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(3, 36, 137, 0.06)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>

      <div>
        <label style={labelStyle}>What do you need?</label>
        <select
          name="need"
          value={formData.need}
          onChange={handleChange}
          required
          style={{
            ...inputBaseStyle,
            color: formData.need ? 'var(--ink)' : '#a0aec0',
            cursor: 'pointer',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 16px center',
            paddingRight: '44px',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(3, 36, 137, 0.06)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <option value="" disabled>Select a service</option>
          <option value="buy">Buy a laptop</option>
          <option value="repair">Repair a device</option>
          <option value="solar">Solar installation</option>
          <option value="it">IT support / Consultation</option>
          <option value="other">Something else</option>
        </select>
      </div>

      <div>
        <label style={labelStyle}>Message</label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Tell us more about what you need..."
          rows={5}
          required
          style={{
            ...inputBaseStyle,
            resize: 'vertical',
            minHeight: '120px',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(3, 36, 137, 0.06)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn primary"
        style={{
          width: '100%',
          justifyContent: 'center',
          padding: '16px',
          fontSize: '1rem',
          opacity: isSubmitting ? 0.7 : 1,
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
        }}
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
            Sending...
          </>
        ) : (
          <>
            <Send size={18} />
            Send Message
          </>
        )}
      </button>

      <p className="form-note">
        This form is a placeholder. Connect to Formspree, Resend, EmailJS, Supabase, or a backend API to handle submissions.
      </p>
    </form>
  );
}

// ==================== MAIN PAGE ====================
export default function ContactPage() {
  return (
    <main>
      {/* ===== UNIQUE CONTACT HERO — CURVED OVERLAP ===== */}
      <section className="contact-hero-section">
        <div className="contact-hero-bg">
          {/* Animated gradient orbs */}
          <div className="contact-hero-orb orb-1" />
          <div className="contact-hero-orb orb-2" />
          <div className="contact-hero-orb orb-3" />

          {/* Grid pattern overlay */}
          <div className="contact-hero-grid" />
        </div>

        <div className="section-shell contact-hero-inner">
          <div className="contact-hero-text">
            <span className="contact-hero-eyebrow">
              <Sparkles size={14} />
              Get In Touch
            </span>
            <h1 className="contact-hero-title">
              Let's talk about your
              <span className="contact-hero-highlight"> technology needs.</span>
            </h1>
            <p className="contact-hero-desc">
              Whether you need a new laptop, device repair, solar installation, or just expert advice — 
              our team at Emmy Technology is here to help. Reach out and we'll respond within 24 hours.
            </p>
            <div className="contact-hero-actions">
              <a href={brand.whatsapp} className="btn primary-light contact-hero-btn">
                <MessageCircle size={18} />
                Chat on WhatsApp
                <ArrowRight size={16} />
              </a>
              <a href={`tel:${brand.phone}`} className="btn ghost contact-hero-btn-alt">
                <Phone size={18} />
                {brand.phoneDisplay}
              </a>
            </div>
          </div>

          <div className="contact-hero-cards">
            <div className="contact-hero-card card-phone">
              <div className="contact-hero-card-icon">
                <Phone size={22} />
              </div>
              <span className="contact-hero-card-label">Call Us</span>
              <span className="contact-hero-card-value">{brand.phoneDisplay}</span>
            </div>
            <div className="contact-hero-card card-email">
              <div className="contact-hero-card-icon">
                <Mail size={22} />
              </div>
              <span className="contact-hero-card-label">Email</span>
              <span className="contact-hero-card-value">{brand.email}</span>
            </div>
            <div className="contact-hero-card card-hours">
              <div className="contact-hero-card-icon">
                <Clock size={22} />
              </div>
              <span className="contact-hero-card-label">Hours</span>
              <span className="contact-hero-card-value">{brand.hours}</span>
            </div>
          </div>
        </div>

        {/* Curved bottom edge */}
        <div className="contact-hero-curve">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 120L1440 120L1440 60C1440 60 1200 0 720 0C240 0 0 60 0 60L0 120Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ===== ASYMMETRIC CONTACT GRID ===== */}
      <section className="section-shell contact-split-section">
        <div className="contact-split-grid">
          {/* LEFT: Dark Contact Info */}
          <div className="contact-info-panel">
            <div className="contact-info-glow" />
            <div className="contact-info-content">
              <span className="section-tag contact-info-tag">
                <MessageCircle size={14} />
                Contact Details
              </span>
              <h2 className="contact-info-title">Reach us directly.</h2>

              <div className="contact-info-list">
                <a href={`tel:${brand.phone}`} className="contact-info-item">
                  <div className="contact-info-item-icon">
                    <Phone size={20} />
                  </div>
                  <div className="contact-info-item-text">
                    <span className="contact-info-item-label">Phone</span>
                    <span className="contact-info-item-value">{brand.phoneDisplay}</span>
                  </div>
                </a>

                <a href={`mailto:${brand.email}`} className="contact-info-item">
                  <div className="contact-info-item-icon">
                    <Mail size={20} />
                  </div>
                  <div className="contact-info-item-text">
                    <span className="contact-info-item-label">Email</span>
                    <span className="contact-info-item-value">{brand.email}</span>
                  </div>
                </a>

                <a href={brand.whatsapp} className="contact-info-item contact-info-whatsapp">
                  <div className="contact-info-item-icon contact-info-whatsapp-icon">
                    <Send size={20} />
                  </div>
                  <div className="contact-info-item-text">
                    <span className="contact-info-item-label">WhatsApp</span>
                    <span className="contact-info-item-value">Message us instantly</span>
                  </div>
                </a>

                <div className="contact-info-item">
                  <div className="contact-info-item-icon">
                    <Clock size={20} />
                  </div>
                  <div className="contact-info-item-text">
                    <span className="contact-info-item-label">Business Hours</span>
                    <span className="contact-info-item-value">{brand.hours}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Branches + Social */}
          <div className="contact-side-stack">
            {/* Branches */}
            <div className="contact-side-card">
              <span className="section-tag">
                <MapPin size={14} />
                Our Locations
              </span>
              <h3 className="contact-side-title">Visit our branches.</h3>

              <div className="branch-list">
                <div className="branch-item">
                  <div className="branch-number">1</div>
                  <div className="branch-text">
                    <strong>Main Campus Store</strong>
                    <span>Shop No 22, Nnamdi Azikwe Hall Mini Market (Black Market), University of Ibadan, Ibadan, Oyo State</span>
                  </div>
                </div>
                <div className="branch-item">
                  <div className="branch-number">2</div>
                  <div className="branch-text">
                    <strong>Sango Branch</strong>
                    <span>Sango, Ibadan, Oyo State</span>
                  </div>
                </div>
              </div>

              <p className="branch-note">
                <MapPin size={12} />
                Google Maps embeds coming soon. Message us on WhatsApp for directions.
              </p>
            </div>

            {/* Social */}
            <div className="contact-side-card">
              <span className="section-tag">
                <ExternalLink size={14} />
                Follow Us
              </span>
              <h3 className="contact-side-title">Connect on social.</h3>

              <div className="social-list">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-item"
                    style={{ '--social-bg': social.bg } as React.CSSProperties}
                  >
                    <span className="social-icon" style={{ color: social.color }}>
                      {social.icon}
                    </span>
                    <span className="social-text">
                      <strong>{social.name}</strong>
                      <span>{social.handle}</span>
                    </span>
                    <ExternalLink size={14} className="social-arrow" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTACT FORM ===== */}
      <section className="section-shell soft-section full-bleed contact-form-section">
        <div className="contact-form-wrapper">
          <div className="section-heading contact-form-heading">
            <span className="section-tag">Send a Message</span>
            <h2>We will get back to you within 24 hours.</h2>
            <p>
              Fill out the form below and our team will respond as quickly as possible. 
              For urgent inquiries, use WhatsApp.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>

      {/* ===== MAP PLACEHOLDER ===== */}
      <section className="section-shell">
        <div className="map-placeholder">
          <div className="map-placeholder-icon">
            <MapPin size={28} />
          </div>
          <h3>Find us on the map</h3>
          <p>
            Google Maps integration coming soon. For now, message us on WhatsApp for directions to either branch.
          </p>
          <a href={brand.whatsapp} className="btn light">
            <MessageCircle size={18} />
            Get Directions via WhatsApp
          </a>
        </div>
      </section>

      <CTA />
    </main>
  );
}