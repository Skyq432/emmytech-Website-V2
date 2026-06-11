'use client';

import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

const iconMap = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
};

interface SocialLinkProps {
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  href: string | null;
  label: string;
}

export default function SocialLink({ platform, href, label }: SocialLinkProps) {
  const Icon = iconMap[platform];

  if (!href) {
    return (
      <button 
        className="team-social-btn team-social-disabled"
        onClick={() => alert(`You care about them so much — ask them yourself!`)}
        title={`Ask ${label} directly`}
        type="button"
      >
        <Icon size={16} />
      </button>
    );
  }

  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="team-social-btn"
      aria-label={label}
    >
      <Icon size={16} />
    </a>
  );
}