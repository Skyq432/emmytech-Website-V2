import Image from 'next/image';
import Link from 'next/link';
import { 
  MapPin, Users, Award, Target, Lightbulb, 
  Shield, Zap, MessageCircle
} from 'lucide-react';
import CTA from '@/components/CTA';
import SocialLink from '@/components/SocialLink';
import { brand, values } from '@/lib/site-data';

export const metadata = { title: 'About Us | Emmy Technology — Trusted Tech Brand in Nigeria' };

const teamMembers = [
  {
    name: 'Emmanuel',
    role: 'Founder & Lead Technician',
    image: '/images/emmanualpic.jpeg',
    socials: { 
      facebook: 'https://www.facebook.com/olanrewajuemma.bunmi', 
      instagram: 'https://www.instagram.com/emmytechofficial?igsh=MWxoMW1lZ2JmaGJvdA==', 
      twitter: 'https://x.com/Emmytech25', 
      linkedin: 'https://www.linkedin.com/in/bunmi-e-olanrewaju-a001541b4?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app' 
    }
  },
  {
    name: 'Kayode Grace Modupe',
    role: 'Operations Manager',
    image: '/images/KAYODE-GRACE-MODUPE.jpeg',
    socials: {
      facebook: 'https://www.facebook.com/grace.kayode.796',
      instagram: 'https://www.instagram.com/grace.kayode.796?igsh=OTNoc2Q5cW94Z3hh',
      twitter: 'https://x.com/grace_kayo1604',
      linkedin: null
    }
  },
  {
    name: 'Osuolale Eniola Helen',
    role: 'Customer Relations & Brand Strategist',
    image: '/images/OSUOLALE-HELEN%20.jpeg',
    socials: {
      facebook: 'https://www.facebook.com/share/1aWX1Nkfgt/',
      instagram: 'https://www.instagram.com/theonlyhelen1?igsh=cGhiZjRveWJraWli',
      twitter: null,
      linkedin: null
    }
  },
  {
    name: 'Oluwaseun Oyindamola Sobowale',
    role: 'Sales Manager',
    image: '/images/Damife.png',
    socials: {
      facebook: 'https://www.facebook.com/share/1Hk6hYgpY7/?mibextid=wwXIfr',
      instagram: 'https://www.instagram.com/damife_s?igsh=anBwOXhtZHlhOW5r&utm_source=qr',
      twitter: 'https://x.com/sobowaledamife?s=21',
      linkedin: null
    }
  },
  {
    name: 'Sulaimon Abdulquddus Olaniyi',
    role: 'Business Consultant',
    image: '/images/quddus.png',
    socials: {
      facebook: 'https://www.facebook.com/share/1EZXQ9QUCi/',
      instagram: 'https://www.instagram.com/olaniyi.sq?igsh=MWNha2lmZmhtamRvdA==',
      twitter: null,
      linkedin: 'https://www.linkedin.com/in/sulaimon-abdulquddus-71060a209?utm_source=share_via&utm_content=profile&utm_medium=member_android'
    }
  },
];

const storyImages = {
  main: '/images/image%202.png',
  side: '/images/image3.png',
  accent: '/images/image5.jpg',
};

export default function AboutPage() {
  return (
    <main>
      {/* ===== HERO ===== */}
      <section className="about-hero-unique">
        <div className="about-hero-unique-inner section-shell">
          <div className="about-hero-unique-text">
            <span className="section-tag">About Emmy Technology</span>
            <h1>Building a smarter future through reliable technology.</h1>
            <p>Emmy Technology is a fast-growing technology solutions company based in Ibadan, Nigeria. We supply genuine gadgets, expert repairs, solar installations and IT support to students, professionals, and organizations across Nigeria</p>
            <div className="about-hero-unique-stats">
              <div className="stat-block">
                <strong>2021</strong>
                <span>Founded</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-block">
                <strong>2</strong>
                <span>Locations</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-block">
                <strong>800+</strong>
                <span>Customers</span>
              </div>
            </div>
          </div>
          <div className="about-hero-unique-visual">
            <div className="hero-image-main">
              <Image 
                src="/images/emmytechsingleimage.jpg" 
                alt="Emmy Technology at work" 
                fill
                className="hero-img-primary" 
                priority 
              />
            </div>
            <div className="hero-image-float">
              <Image 
                src="/images/image1.png"
                alt="Emmy Technology team member" 
                fill
                className="hero-img-secondary" 
              />
            </div>
            <div className="hero-badge-float">
              <Users size={18} />
              <span>10+ Team Members</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STORY ===== */}
      <section className="section-shell story-section">
        <div className="story-layout">
          <div className="story-images-cluster">
            <div className="story-img-main">
              <Image 
                src={storyImages.main}
                alt="Emmy Technology team collaboration" 
                fill
                className="story-img" 
              />
            </div>
            <div className="story-img-side">
              <Image 
                src={storyImages.side}
                alt="Emmy Technology professional" 
                fill
                className="story-img" 
              />
            </div>
            <div className="story-img-accent">
              <Image 
                src={storyImages.accent}
                alt="Emmy Technology workspace" 
                fill
                className="story-img" 
              />
            </div>
          </div>
          <div className="story-content">
            <span className="section-tag">Our Story</span>
            <h2>From a single desk to multiple thriving locations and beyond.</h2>
            <p>Emmy Technology started with a simple belief: everyone deserves access to genuine technology, clear advice and dependable support. What began as a small operation helping students find reliable laptops has grown into a full-service technology company.</p>
            <p>Today, we serve hundreds of customers across Ibadan — from undergraduates needing their first laptop to businesses requiring complete solar power setups. Every device we sell, every repair we complete and every installation we delivers carries the same promise: quality you can trust, service you can depend on.</p>
            <div className="story-highlights">
              <div className="story-highlight">
                <Target size={20} />
                <span>Student-focused pricing</span>
              </div>
              <div className="story-highlight">
                <Shield size={20} />
                <span>Genuine products only</span>
              </div>
              <div className="story-highlight">
                <Zap size={20} />
                <span>Same-day repair turnaround</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MISSION & VISION ===== */}
      <section className="section-shell soft-section full-bleed">
        <div className="mission-grid">
          <article className="mission-card">
            <div className="mission-icon"><Lightbulb size={28} /></div>
            <h3>Our Mission</h3>
            <p>To make quality technology accessible, affordable and stress-free for every student, professional and business in Ibadan. We do this by selling genuine products, delivering expert repairs and providing renewable energy solutions that actually work.</p>
          </article>
          <article className="mission-card">
            <div className="mission-icon"><Award size={28} /></div>
            <h3>Our Vision</h3>
            <p>To become Nigeria&apos;s most trusted local technology brand — known not just for what we sell, but for how we treat every customer. We want Emmy Technology to be the first name people think of when they need tech they can rely on.</p>
          </article>
        </div>
      </section>

      {/* ===== VALUES ===== */}
      <section className="section-shell">
        <div className="section-heading">
          <span className="section-tag">What We Stand For</span>
          <h2>Nigeria&apos;s Most Trusted Tech Partner</h2>
        </div>
        <div className="values-grid">
          {values.map(({ title, text, icon: Icon }) => (
            <div className="value-card" key={title}>
              <div className="value-icon"><Icon size={24} /></div>
              <strong>{title}</strong>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== TEAM — HORIZONTAL CAROUSEL ===== */}
      <section className="section-shell team-section">
        <div className="section-heading">
          <span className="section-tag">The People</span>
          <h2>Meet the team behind Emmy Technology.</h2>
          <p>A passionate team of engineers, technicians and customer support specialists working to bring you the best technology experience in Ibadan.</p>
        </div>
        <div className="team-carousel-wrapper">
          <div className="team-carousel-track">
            {[...teamMembers, ...teamMembers].map((member, idx) => (
              <div className="team-member-card" key={`${idx}-${member.name}`}>
                <div className="team-member-image">
                  <Image 
                    src={member.image} 
                    alt={member.name} 
                    fill
                    className="team-img"
                    style={{ objectPosition: 'top center' }}
                  />
                  <div className="team-member-overlay">
                    <div className="team-socials">
                      <SocialLink 
                        platform="facebook"
                        href={member.socials.facebook ?? null} 
                        label={`${member.name} on Facebook`}
                      />
                      <SocialLink 
                        platform="instagram"
                        href={member.socials.instagram ?? null} 
                        label={`${member.name} on Instagram`}
                      />
                      <SocialLink 
                        platform="twitter"
                        href={member.socials.twitter ?? null} 
                        label={`${member.name} on Twitter`}
                      />
                      {member.socials.linkedin && (
                        <SocialLink 
                          platform="linkedin"
                          href={member.socials.linkedin} 
                          label={`${member.name} on LinkedIn`}
                        />
                      )}
                    </div>
                  </div>
                </div>
                <div className="team-member-info">
                  <strong>{member.name}</strong>
                  <span>{member.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="team-more-coming">
          <MessageCircle size={18} />
          <span>More team members joining soon. Stay tuned.</span>
        </div>
      </section>

      <CTA />
    </main>
  );
}