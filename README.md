# Emmy Technology Website

A modern multi-page Next.js website for Emmy Technology, built with dedicated pages for every main navigation item.

## Pages

- `/` — Home
- `/about` — About Emmy Technology
- `/services` — Services
- `/products` — Products and future e-commerce structure
- `/portfolio` — Project/photo gallery structure
- `/ambassador` — Campus Ambassador Program
- `/contact` — Contact and branch information

## Brand Colours

- Primary: `#032489`
- Secondary: `#ffb100`

## Start the Project

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Project Manager Check

```bash
npm run pm-check
```

This checks the project routes and key files.

## Manual Photo Work Needed

The project uses temporary online image links and labelled image spaces. Replace them with real Emmy Technology photos.

1. Download the photos from the Google Photos and Pixieset links provided by the client.
2. Add photos into `public/images/gallery/`.
3. Open `lib/site-data.ts`.
4. Replace the `recommendedImages` URLs with local paths, for example:

```ts
hero: '/images/gallery/hero.jpg'
```

## E-commerce Work Needed Later

The Products page is prepared for product listings, but live e-commerce still needs backend work:

- Product upload/admin dashboard.
- Product images and real prices.
- Stock status.
- Cart and checkout.
- Payment integration.
- Order notification via email/WhatsApp.

## Contact Form Work Needed Later

The contact form is a UI placeholder. Connect it using a preferred service such as a Next.js API route, Formspree, Resend, EmailJS, Supabase or another backend.
