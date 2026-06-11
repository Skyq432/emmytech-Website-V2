"use client";

import { useState, useRef, useEffect } from 'react';
import CTA from '@/components/CTA';
import { Play, X, ChevronLeft, ChevronRight, Star, Users, Heart, ShoppingBag, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Portfolio items with EXACT file paths from your folder
const portfolioItems = [
  {
    id: 1,
    type: 'video' as const,
    src: '/images/Portfolio-content/6.mp4',
    title: 'Grand Opening — Sango Branch',
    category: 'Milestone',
    description: 'Celebrating the launch of our second location at Sango, Ibadan.',
    icon: Star as LucideIcon,
    size: 'large' as const,
  },
  {
    id: 2,
    type: 'image' as const,
    src: '/images/Portfolio-content/14.jpg',
    title: 'Grand Opening Celebration',
    category: 'Milestone',
    description: 'The energy was electric as we opened our doors to serve Ibadan better.',
    icon: Star as LucideIcon,
    size: 'medium' as const,
  },
  {
    id: 3,
    type: 'video' as const,
    src: '/images/Portfolio-content/7.mp4',
    title: 'Faculty of Technology Freshers Welcome',
    category: 'Campus',
    description: 'Connecting with the next generation of tech leaders at UI.',
    icon: Users as LucideIcon,
    size: 'medium' as const,
  },
  {
    id: 4,
    type: 'video' as const,
    src: '/images/Portfolio-content/8.mp4',
    title: 'Science Faculty Orientation',
    category: 'Campus',
    description: 'Bringing technology solutions to Science students at University of Ibadan.',
    icon: Users as LucideIcon,
    size: 'large' as const,
  },
  {
    id: 5,
    type: 'video' as const,
    src: '/images/Portfolio-content/9.mp4',
    title: 'Nnamdi Azikiwe Hall Showcase',
    category: 'Campus',
    description: 'Showcasing Emmy Technology at one of UI most iconic halls.',
    icon: Users as LucideIcon,
    size: 'medium' as const,
  },
  {
    id: 6,
    type: 'image' as const,
    src: '/images/Portfolio-content/1.jpg',
    title: 'Valentine Sales Campaign',
    category: 'Sales',
    description: 'Special season, special deals for our beloved customers.',
    icon: Heart as LucideIcon,
    size: 'medium' as const,
  },
  {
    id: 7,
    type: 'image' as const,
    src: '/images/Portfolio-content/2.webp',
    title: 'Valentine Deals',
    category: 'Sales',
    description: 'Love is in the air, and so are our discounts.',
    icon: Heart as LucideIcon,
    size: 'small' as const,
  },
  {
    id: 8,
    type: 'image' as const,
    src: '/images/Portfolio-content/3.webp',
    title: 'Season of Love, Season of Tech',
    category: 'Sales',
    description: 'Gift your loved ones the technology they deserve.',
    icon: Heart as LucideIcon,
    size: 'small' as const,
  },
  {
    id: 9,
    type: 'video' as const,
    src: '/images/Portfolio-content/10.mp4',
    title: 'Fully Restocked',
    category: 'Sales',
    description: 'Fresh inventory, fresh deals. Your favourite gadgets are back.',
    icon: ShoppingBag as LucideIcon,
    size: 'medium' as const,
  },
  {
    id: 10,
    type: 'video' as const,
    src: '/images/Portfolio-content/11.mp4',
    title: 'Customer Trust',
    category: 'Testimonial',
    description: 'We let our work speak for itself. Real reviews, real trust.',
    icon: Star as LucideIcon,
    size: 'large' as const,
  },
  {
    id: 11,
    type: 'video' as const,
    src: '/images/Portfolio-content/12.mp4',
    title: 'Valentine Gift Guide',
    category: 'Sales',
    description: 'The perfect tech gift for that special someone.',
    icon: Heart as LucideIcon,
    size: 'medium' as const,
  },
  {
    id: 12,
    type: 'video' as const,
    src: '/images/Portfolio-content/13.mp4',
    title: 'UCH Brand Ambassadors',
    category: 'Campus',
    description: 'Our ambassadors representing Emmy Technology across campus.',
    icon: Users as LucideIcon,
    size: 'medium' as const,
  },
  {
    id: 13,
    type: 'video' as const,
    src: '/images/Portfolio-content/15.mp4',
    title: 'UI Freshmen Interviews',
    category: 'Campus',
    description: 'Hearing from the newest members of the UI community.',
    icon: Users as LucideIcon,
    size: 'medium' as const,
  },
  {
    id: 14,
    type: 'video' as const,
    src: '/images/Portfolio-content/16.mp4',
    title: 'Positioning for Profit',
    category: 'Business',
    description: 'Learning, growing, and positioning Emmy Technology for greater impact.',
    icon: Zap as LucideIcon,
    size: 'medium' as const,
  },
  {
    id: 15,
    type: 'video' as const,
    src: '/images/Portfolio-content/17.mp4',
    title: 'Digital Wealth Conference 2.0',
    category: 'Business',
    description: 'Our CEO representing Emmy Technology at the Digital Wealth Conference.',
    icon: Zap as LucideIcon,
    size: 'large' as const,
  },
  {
    id: 16,
    type: 'image' as const,
    src: '/images/Portfolio-content/4.webp',
    title: 'Behind the Scenes',
    category: 'Team',
    description: 'The people who make Emmy Technology what it is.',
    icon: Users as LucideIcon,
    size: 'small' as const,
  },
  {
    id: 17,
    type: 'image' as const,
    src: '/images/Portfolio-content/5.webp',
    title: 'Something Big is Coming',
    category: 'Announcement',
    description: 'Stay tuned. Emmy Technology is always evolving.',
    icon: Zap as LucideIcon,
    size: 'small' as const,
  },
  {
    id: 18,
    type: 'video' as const,
    src: '/images/Portfolio-content/18.mp4',
    title: 'Special Feature',
    category: 'Announcement',
    description: 'Exciting updates from Emmy Technology.',
    icon: Zap as LucideIcon,
    size: 'medium' as const,
  },
];

const categories = ['All', 'Milestone', 'Campus', 'Sales', 'Testimonial', 'Business', 'Team', 'Announcement'];

export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());

  const filteredItems = activeCategory === 'All' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === activeCategory);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto';
    videoRefs.current.forEach(video => {
      if (video) video.pause();
    });
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setLightboxIndex(prev => prev === 0 ? filteredItems.length - 1 : prev - 1);
    } else {
      setLightboxIndex(prev => prev === filteredItems.length - 1 ? 0 : prev + 1);
    }
  };

  const handleImageError = (id: number) => {
    setFailedImages(prev => new Set(prev).add(id));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox('prev');
      if (e.key === 'ArrowRight') navigateLightbox('next');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, filteredItems.length]);

  const currentItem = filteredItems[lightboxIndex];

  return (
    <main>
      {/* CUSTOM HERO with local image */}
      <section className="portfolio-hero">
        <div className="portfolio-hero-inner section-shell">
          <div className="portfolio-hero-text">
            <span className="section-tag">Portfolio</span>
            <h1>Every project tells a story. Here is ours.</h1>
            <p>From campus activations and grand openings to customer testimonials and behind-the-scenes moments — see Emmy Technology in action across Ibadan.</p>
            <a href="/contact" className="btn primary">Start Your Project</a>
          </div>
          <div className="portfolio-hero-visual">
            <img 
              src="/images/emmytechstanding.png" 
              alt="Emmy Technology team" 
              className="portfolio-hero-img"
            />
          </div>
        </div>
      </section>

      {/* ===== CATEGORY FILTER ===== */}
      <section className="section-shell" style={{ paddingBottom: '20px' }}>
        <div className="portfolio-filter">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ===== MASONRY GALLERY ===== */}
      <section className="section-shell" style={{ paddingTop: '20px' }}>
        <div className="masonry-grid">
          {filteredItems.map((item, index) => {
            const IconComponent = item.icon;
            const hasFailed = failedImages.has(item.id);
            return (
              <div
                key={item.id}
                className={`masonry-item masonry-item-${item.size} ${hasFailed ? 'masonry-failed' : ''}`}
                onMouseEnter={() => {
                  setHoveredId(item.id);
                  const video = videoRefs.current.get(item.id);
                  if (video && item.type === 'video') {
                    video.play().catch(() => {});
                  }
                }}
                onMouseLeave={() => {
                  setHoveredId(null);
                  const video = videoRefs.current.get(item.id);
                  if (video && item.type === 'video') {
                    video.pause();
                    video.currentTime = 0;
                  }
                }}
                onClick={() => !hasFailed && openLightbox(index)}
              >
                <div className="masonry-media">
                  {item.type === 'video' ? (
                    <>
                      <video
                        ref={(el) => {
                          if (el) videoRefs.current.set(item.id, el);
                        }}
                        src={item.src}
                        className="masonry-video"
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        onError={() => handleImageError(item.id)}
                      />
                      <div className={`video-play-overlay ${hoveredId === item.id ? 'hidden' : ''}`}>
                        <Play size={32} fill="white" />
                      </div>
                    </>
                  ) : (
                    <img
                      src={item.src}
                      alt={item.title}
                      className="masonry-img"
                      loading="lazy"
                      onError={() => handleImageError(item.id)}
                    />
                  )}
                </div>

                <div className={`masonry-overlay ${hoveredId === item.id ? 'visible' : ''}`}>
                  <div className="masonry-overlay-content">
                    <span className="masonry-category">
                      <IconComponent size={14} />
                      {item.category}
                    </span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <span className="masonry-view">
                      {item.type === 'video' ? 'Watch Video' : 'View Image'} →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== LIGHTBOX ===== */}
      {lightboxOpen && currentItem && (
        <div className="lightbox" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>
            <X size={28} />
          </button>

          <button 
            className="lightbox-nav lightbox-prev" 
            onClick={(e) => { e.stopPropagation(); navigateLightbox('prev'); }}
          >
            <ChevronLeft size={32} />
          </button>

          <button 
            className="lightbox-nav lightbox-next" 
            onClick={(e) => { e.stopPropagation(); navigateLightbox('next'); }}
          >
            <ChevronRight size={32} />
          </button>

          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            {currentItem.type === 'video' ? (
              <video
                src={currentItem.src}
                controls
                autoPlay
                className="lightbox-video"
              />
            ) : (
              <img
                src={currentItem.src}
                alt={currentItem.title}
                className="lightbox-img"
              />
            )}
            <div className="lightbox-info">
              <span className="lightbox-category">{currentItem.category}</span>
              <h3>{currentItem.title}</h3>
              <p>{currentItem.description}</p>
            </div>
          </div>

          <div className="lightbox-counter">
            {lightboxIndex + 1} / {filteredItems.length}
          </div>
        </div>
      )}

      {/* ===== STATS BAR ===== */}
      <section className="section-shell soft-section full-bleed">
        <div className="portfolio-stats">
          <div className="stat-item">
            <span className="stat-number">500+</span>
            <span className="stat-label">Happy Customers</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">2</span>
            <span className="stat-label">Branches</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">6+</span>
            <span className="stat-label">Years Serving Ibadan</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-number">10+</span>
            <span className="stat-label">Campus Events</span>
          </div>
        </div>
      </section>

      <CTA />
    </main>
  );
}