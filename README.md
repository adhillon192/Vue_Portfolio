# Amardeep Dhillon Portfolio

This is my personal portfolio built with Nuxt 3 and Nuxt UI. It showcases my experience, projects, and blog posts, and it is configured to be simple to run publicly.

## Tech Stack

- Nuxt 3 with Nuxt UI
- Nuxt Content for markdown/YAML-driven pages
- Tailwind CSS for styling
- Hosted images via CDN (Cloudinary) where needed

## Content Structure

- `content/index.yml` drives the homepage hero, about, experience, testimonials, FAQ
- `content/projects/*.yml` holds project cards
- `content/blog/*.md` holds blog articles

Edit these files to update copy, links, and images without touching Vue components.

## Getting Started

```bash
pnpm install
pnpm dev # http://localhost:3000
```

## Build and Preview

```bash
pnpm build
pnpm preview
```

## Deployment

This app is static-friendly. Deploy the `.output/public` folder (after `pnpm build`) to any static host, or use platforms like Vercel/Netlify that run the build step automatically.

## Customizing

- Update site text and data in `content/`
- Global settings (name, avatar, links) live in `app/app.config.ts`
- Components for sections are in `app/components/landing/`

## License

MIT
