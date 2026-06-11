# Emmy Technology Website — Project Manager Agent

This file acts like a project management reviewer for the website. Use it before pushing changes or handing the project to the developer.

## Main Direction

The website should not feel like a one-page landing page. Every main navigation item has its own page:

- Home: `/`
- About: `/about`
- Services: `/services`
- Products: `/products`
- Portfolio: `/portfolio`
- Ambassador: `/ambassador`
- Contact: `/contact`

## Brand Rules

- Primary colour: `#032489`
- Secondary colour: `#ffb100`
- Use Emmy Technology logos from `public/images/`.
- Keep the site modern, professional, clean and mobile-friendly.
- Do not overcrowd sections. Use spacing, cards and clear headings.

## Competitor Review Notes

The structure was improved after reviewing Nigerian tech/e-commerce/service websites. The goal is to be clearer and more professional than basic competitor layouts by combining:

- Strong service positioning.
- Dedicated pages, not a single long page.
- Product-category structure for future e-commerce.
- WhatsApp/contact CTAs.
- Portfolio proof sections.
- Photo placeholders for real Emmy Technology visuals.

## Image Replacement Task

The current layout uses image spaces and temporary online image URLs in `lib/site-data.ts`.

Replace these with real Emmy Technology photos from:

- Google Photos link provided by the client.
- Pixieset campus awareness link provided by the client.
- Uploaded brand logo files.

Best photos to add:

- Hero image: branded shop, team, customer service or campus awareness image.
- Product images: laptops, phones, accessories, solar/inverter products.
- Services: technician repair photos, solar installation photos, store support desk.
- Portfolio: campus awareness, repair projects, customer handover, product displays.
- Ambassador page: group/student leadership photos.
- Contact page: office/storefront photos.

## Manual Developer Tasks

1. Download the approved photos manually from Google Photos and Pixieset.
2. Put the photos in `public/images/gallery/`.
3. Replace the `recommendedImages` URLs in `lib/site-data.ts` with local paths such as `/images/gallery/hero.jpg`.
4. Add real product names, prices, specs and stock status.
5. Connect the contact form to a backend/form service.
6. Add Google Maps links or embeds for the two branches.
7. Add actual e-commerce features when ready: product upload dashboard, cart, checkout and admin authentication.

## Page-by-Page Quality Checklist

### Home
- Hero makes Emmy Technology clear within 5 seconds.
- CTAs go to products and WhatsApp repair booking.
- Product cards are visible above service details.
- Portfolio preview shows visual proof.

### About
- Story, mission, vision and values are clear.
- It does not sound generic.
- It mentions the two Ibadan branch areas accurately.

### Services
- Each service has a card, image space, bullets and CTA.
- Repair, sales, solar and IT support are all included.

### Products
- Product categories are easy to scan.
- Product cards can be replaced with live inventory.
- E-commerce notes tell the developer what to add next.

### Portfolio
- Gallery layout is ready for real photos.
- Each portfolio item explains what the project/photo represents.

### Ambassador
- Clear student value proposition.
- Benefits are easy to understand.
- CTA goes to WhatsApp for now.

### Contact
- Phone, email, WhatsApp, hours and branch addresses are visible.
- Form is labelled as placeholder until connected.

## Run the Project Manager Check

Use:

```bash
npm run pm-check
```

The script checks whether required routes and important project files exist.
