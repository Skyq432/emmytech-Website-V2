import { BatteryCharging, Cpu, Laptop, MapPin, Phone, ShieldCheck, Smartphone, SunMedium, Star, Wrench, Wifi, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const brand = {
  name: 'Emmy Technology',
  tagline: 'Empowering Lives Through Technology.',
  primary: '#032489',
  secondary: '#ffb100',
  phone: '+2348146503700',
  phoneDisplay: '+234 814 650 3700',
  email: 'info@emmytechnology.com',
  website: 'www.emmytechnology.com',
  hours: 'Monday – Saturday: 8:00 AM – 6:00 PM',
  whatsapp: 'https://wa.me/2348146503700',
  branches: [
    'Shop 22, Nnamdi Azikiwe Hall Mini Market (Black Market), University of Ibadan, Ibadan, Oyo State.',
    'SPAC Church Area, Poly Road, Sango, Ibadan, Oyo State.'
  ]
};

export const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/products', label: 'Products' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/ambassador', label: 'Ambassador' },
  { href: '/contact', label: 'Contact' },
];

// All images from Unsplash source - works with regular <img> tags without next.config.js
export const recommendedImages = {
  hero: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1400&q=80',
  laptop: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
  repair: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80',
  solar: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80',
  accessories: '/images/gadget.png',  // LOCAL IMAGE
  campus: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
  shop: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
  phone: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
  network: '/images/IT.png',  // LOCAL IMAGE
  workspace: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80',
  tools: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80',
  energy: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&q=80',
};

export const services = [
  { slug: 'laptop-sales', title: 'Laptop Sales', icon: Laptop as LucideIcon, imageKey: 'laptop', text: 'Clean UK-used and brand-new laptops for students, professionals, creatives, businesses and gamers, with practical buying advice before payment.', bullets: ['Student-ready laptop recommendations', 'Business and workstation options', 'Transparent specifications and upgrade advice'] },
  { slug: 'smartphone-sales', title: 'Smartphone Sales', icon: Smartphone as LucideIcon, imageKey: 'phone', text: 'Reliable smartphones and mobile devices selected to keep customers connected, productive and entertained.', bullets: ['Android and iPhone options', 'Accessory pairing guidance', 'After-sales device support'] },
  { slug: 'repairs-maintenance', title: 'Device Repairs & Maintenance', icon: Wrench as LucideIcon, imageKey: 'repair', text: 'Professional diagnosis, repairs, upgrades and maintenance for laptops, phones and essential work devices.', bullets: ['Screen, battery, keyboard and charging faults', 'Software troubleshooting and optimization', 'RAM, SSD and performance upgrades'] },
  { slug: 'solar-installation', title: 'Solar Installation Services', icon: SunMedium as LucideIcon, imageKey: 'solar', text: 'Reliable solar energy solutions for homes, hostels, schools, offices and small businesses seeking stable power alternatives.', bullets: ['Home and office solar planning', 'Inverter and battery support', 'Power needs assessment'] },
  { slug: 'accessories-gadgets', title: 'Accessories & Gadgets', icon: BatteryCharging as LucideIcon, imageKey: 'accessories', text: 'Quality chargers, power banks, headphones, keyboards, storage, networking equipment and everyday tech accessories.', bullets: ['Chargers and power accessories', 'Storage and networking devices', 'Audio and productivity gadgets'] },
  { slug: 'it-consulting-support', title: 'IT Consulting & Support', icon: Cpu as LucideIcon, imageKey: 'network', text: 'Technology consultation, system setup, troubleshooting and support for individuals, teams and organizations.', bullets: ['Office and campus technology setup', 'Network and system troubleshooting', 'Procurement advice for teams'] },
];

export const categories = ['Laptops', 'Smartphones', 'Tablets', 'Accessories', 'Networking Devices', 'Solar Products', 'Storage Devices', 'Special Deals'];

export const productHighlights = [
  { name: 'Student Laptop Deals', category: 'Laptops', price: 'Request current price', note: 'Best for assignments, online classes, design basics and everyday productivity.', imageKey: 'laptop' },
  { name: 'Smartphone Selection', category: 'Mobile Devices', price: 'Request current price', note: 'Reliable phones with clear recommendations based on usage and budget.', imageKey: 'phone' },
  { name: 'Chargers, Power Banks & Accessories', category: 'Accessories', price: 'Available in-store', note: 'Everyday essentials for students, workers and business owners.', imageKey: 'accessories' },
  { name: 'Solar & Inverter Products', category: 'Solar Products', price: 'Quote after assessment', note: 'Power support products for homes, shops, offices and hostels.', imageKey: 'solar' },
];

export const portfolioItems = [
  { title: 'Professional laptop repairs', type: 'Repair Work', imageKey: 'repair', text: 'Diagnosis, part replacement and performance recovery for customers who need fast device turnaround.' },
  { title: 'Device upgrades and optimization', type: 'Performance', imageKey: 'laptop', text: 'RAM, SSD, software cleanup and system optimization for smoother everyday work.' },
  { title: 'Solar installation projects', type: 'Energy', imageKey: 'solar', text: 'Solar and inverter support for customers who need more dependable power.' },
  { title: 'Campus technology support solutions', type: 'Campus', imageKey: 'campus', text: 'Student-focused gadget advice, repair support and campus ambassador activities.' },
  { title: 'Business technology deployments', type: 'Business', imageKey: 'workspace', text: 'Device sourcing, setup and support for offices, teams and small businesses.' },
  { title: 'Home and office technology setups', type: 'Setup', imageKey: 'network', text: 'Networking, accessories and practical support for productive workspaces.' },
];

export const values = [
  { title: 'Integrity', text: 'Honest recommendations, clear pricing and transparent service communication.', icon: ShieldCheck as LucideIcon },
  { title: 'Excellence', text: 'Quality products, careful repairs and customer experiences that feel professional.', icon: Star as LucideIcon },
  { title: 'Innovation', text: 'Practical technology solutions that help customers work smarter.', icon: Zap as LucideIcon },
  { title: 'Customer First', text: 'Advice and support built around each customer real need and budget.', icon: Phone as LucideIcon },
  { title: 'Reliability', text: 'Dependable service from purchase to repair, support and follow-up.', icon: Wifi as LucideIcon },
  { title: 'Community', text: 'Strong connection with students, businesses and households in Ibadan.', icon: MapPin as LucideIcon },
];

export const testimonials = [
  'Emmy Technology provided excellent guidance when I needed a laptop for my academic work. The service was professional from start to finish.',
  'Their repair team fixed my laptop quickly and saved me the cost of buying a new one.',
  'I appreciate their honesty, professionalism, and commitment to customer satisfaction.'
];

export const ambassadorBenefits = [
  'Leadership experience',
  'Networking opportunities',
  'Exclusive rewards and incentives',
  'Professional development',
  'Access to special promotions',
  'Hands-on campus technology experience'
];

export const competitorsBenchmarked = [
  'Hybridtech Engineering & IT: clear repair/service positioning, quote CTA and campus proximity.',
  'Skysoft ICT Hub: combines sales, repairs, solar, digital services, quick request and cart links.',
  'Plenitude Technology Limited: product/category depth for foreign-used laptops and gadgets in Ibadan.'
];

export const managementChecks = [
  'Every main navigation item has a dedicated route/page.',
  'Every page includes a clear headline, service/product context and conversion CTA.',
  'Image slots are clearly labelled for manual replacement with Emmy Technology photos.',
  'Brand colours are consistently applied: #032489 and #ffb100.',
  'Mobile-first layout avoids overflow and oversized cards on small screens.',
  'Product pages are prepared for future e-commerce integration.'
];