import React from 'react';

export interface ImageSlotProps {
  imageKey?: string;
  label?: string;
  height?: 'sm' | 'md' | 'lg' | 'large';
  className?: string;
  src?: string;
  alt?: string;
}

const imageMap: Record<string, string> = {
  laptop: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80&fit=crop',
  studentLaptop: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80&fit=crop',
  phone: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80&fit=crop',
  smartphone: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&q=80&fit=crop',
  accessories: '/images/gadget.png',
  charger: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80&fit=crop',
  solar: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80&fit=crop',
  inverter: 'https://images.unsplash.com/photo-1548337138-e87d889cc369?w=800&q=80&fit=crop',
  hero: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&q=85&fit=crop',
  shop: 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=800&q=80&fit=crop',
  campus: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80&fit=crop',
  repair: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80&fit=crop',
  portfolio1: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80&fit=crop',
  portfolio2: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80&fit=crop',
  portfolio3: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=600&q=80&fit=crop',
  portfolio4: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80&fit=crop',
  network: '/images/IT.png',
  workspace: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80&fit=crop',
  tools: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80&fit=crop',
  energy: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&q=80&fit=crop',
};

export default function ImageSlot({ imageKey, label, height = 'md', className = '', src, alt }: ImageSlotProps) {
  const imageUrl = src || (imageKey && imageMap[imageKey] 
    ? imageMap[imageKey] 
    : null);

  if (!imageUrl) {
    return (
      <div 
        className={`image-slot image-slot-${height} image-slot-empty ${className}`}
        role="img"
        aria-label={alt || label || imageKey || 'Empty image slot'}
      >
        <div className="image-slot-placeholder">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <span>{alt || label || imageKey || 'Image'}</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`image-slot image-slot-${height} ${className}`}
      role="img"
      aria-label={alt || label || imageKey || 'Image'}
    >
      <img 
        src={imageUrl} 
        alt={alt || label || imageKey || 'Product image'}
        className="image-slot-img"
        loading="lazy"
      />
    </div>
  );
}