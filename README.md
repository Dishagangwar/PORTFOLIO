# Developer Portfolio

An immersive, 3D developer portfolio for a Flutter developer and mobile engineer. It's built with Next.js 16, React 19, React Three Fiber, GSAP, Motion and Lenis.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build && npm start   # production build
npm run lint
```

Requires Node 20.9 or newer. The project was built and tested on Node 24.

## Make it yours

**All content lives in one file: [`src/content/site.ts`](src/content/site.ts).** Every value in `[SQUARE BRACKETS]` is a placeholder. Search the file for `[` and replace each one.

| What | Where in `site.ts` |
| --- | --- |
| Name, initials, location, availability, email | `site` |
| GitHub, LinkedIn, Instagram | `site.socials` |
| SEO title, description, domain | `site.seo` |
| About copy and principles | `about` |
| Skill categories | `skillCategories`, `alsoExploring` |
| Projects (Netguard AI, CareLink, Affirm) | `projects` |
| Experience timeline (internship, Flutter work, DevUp VP) | `experience` |
| Technologies orbiting the hero object | `heroOrbit` |

Other things to update:

- **Resume:** put your PDF at `public/resume.pdf`. To use a different file, change `site.resumeUrl`.
- **Project screenshots:** each project shows a generated, animated preview by default. To use a real screenshot, add the image to `public/projects/` and set `image: "/projects/netguard.jpg"` on that project.
- **Project links:** while a GitHub or demo URL is still a placeholder, its button shows as a dashed "[add link]" chip and isn't clickable. It becomes a real link once you enter the URL.
- **Favicon:** replace `src/app/favicon.ico`.

## Contact form

The form posts to `src/app/api/contact/route.ts`. That route validates the input on the server (with the same rules as the client) and sends the email through [Resend](https://resend.com).

Until it's configured, the route returns **503**. The form then shows a clear error message with a direct mailto link. It never fakes a success.

To enable it:

1. Create a Resend account and an API key.
2. `cp .env.example .env.local` and fill in:
   ```
   RESEND_API_KEY=re_...
   CONTACT_TO_EMAIL=you@example.com
   # optional, needs a domain verified in Resend:
   CONTACT_FROM_EMAIL="Portfolio <hello@your-domain.com>"
   ```
3. Restart `npm run dev`. On your host (for example Vercel), add the same variables under Project → Settings → Environment Variables.

The form also has a hidden honeypot field that quietly drops bot submissions.

## Deploy

**Vercel (recommended):** push to GitHub, import the repo at vercel.com/new, add the environment variables above, and deploy. No extra configuration is needed.

**Any Node host:** run `npm run build`, then `npm start` (port 3000, or set `PORT`).

The homepage is prerendered as static HTML. Only `/api/contact` runs on the server.

## Architecture

```
src/
  app/
    layout.tsx            fonts (Geist, Geist Mono, Instrument Serif), metadata
    page.tsx              composes all sections
    globals.css           Tailwind v4 theme tokens, utilities, keyframes
    api/contact/route.ts  validated contact endpoint (Resend)
  content/site.ts         ← all editable content
  components/
    providers/            IntroProvider (loader → hero sync), SmoothScroll (Lenis + GSAP ticker)
    three/                HeroScene (R3F) + GLSL shaders
    sections/             Hero, About, Skills, Projects, Experience, Contact, Footer
    ui/                   Nav, Cursor, Loader, Button, Magnetic, Reveal, TiltCard, SectionHeader, Icons
    visuals/              Workspace (About) and generated project previews
  lib/                    scroll helpers, pointer store, validation
```

### Motion system

- **Lenis** handles smooth scrolling. It runs on GSAP's ticker so ScrollTrigger stays in sync.
- **GSAP ScrollTrigger** drives the pinned horizontal Projects scroll (with an inner parallax per card) and the scrubbed Experience timeline line.
- **Motion** handles the split-text reveals, magnetic buttons, 3D tilt, the nav pill, the mobile menu, modals and scroll-linked parallax.
- **React Three Fiber** renders the hero:
  - a custom-shader displaced blob with a fresnel and iridescent look, lit by a light that follows the mouse
  - a wireframe shell and orbit rings
  - an interactive particle field that pushes away from the cursor
  - DOM labels for the tech stack, projected from 3D orbit positions

### Performance and accessibility

- The 3D bundle loads with `next/dynamic` (`ssr: false`) once the browser is idle, so text paints first. A CSS glow stands in until it's ready.
- The render loop pauses when the hero is offscreen. Geometry detail and particle count drop on small or low-core devices, and the drei `PerformanceMonitor` lowers the pixel ratio when frame rate falls.
- Animations are transform- and opacity-based, and layouts reserve their space, so content doesn't shift.
- `prefers-reduced-motion` turns off Lenis, the loader, the custom cursor, parallax, orbit spin and 3D motion. Reveals become simple fades.
- The page includes:
  - a skip link and visible focus rings
  - semantic landmarks and `aria-current` on the nav
  - a modal with focus handling and Escape to close
  - form errors announced through `role="alert"`
- The custom cursor only turns on for fine pointers. Touch devices keep native behaviour.
