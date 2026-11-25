# Developer Portfolio

An immersive, 3D developer portfolio for a Flutter developer and mobile engineer. It's built with Next.js 16, React 19, React Three Fiber, Motion and Lenis.

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
| Projects: Flutter & Dart and Kotlin & XML showcases | `projectCategories` |
| Experience timeline (internship, Flutter work, DevUp VP) | `experience` |
| Flipping words in the hero, photo and title on the highway banner | `site.flipWords`, `site.portrait`, `site.bannerTitle` |

Other things to update:

- **Resume:** replace `public/Disha-Gangwar-Resume.pdf`, or point `site.resumeUrl` at another file.
- **Project screenshots:** each project shows device frames with a placeholder screen. Add portrait app screenshots to `public/projects/` and set `screenshots: ["/projects/medsagar-1.png", "/projects/medsagar-2.png"]` on that project (up to 3 are shown inside the frames).
- **Project tech stacks:** only the technologies implied by each category are pre-filled (Flutter/Dart; Kotlin/XML/Android SDK). Replace the `[Add tech]` entry with what each app actually uses. Set `demo: ""` to hide the Live Demo button for apps without one.
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
    providers/            IntroProvider (loader → hero sync), SmoothScroll (Lenis)
    drive/                the 3D world: DriveStage (fixed canvas), DriveScene (camera director),
                          Car, Scenery (sky, road, city, gantries, tunnel), Displays (phones, banner, screen)
    sections/             Hero, About, Skills, Projects, Experience, Contact, Footer
    ui/                   Nav, Cursor, Loader, DriveHud, Panel, FlipWord, Reveal, Button, Magnetic, SectionHeader, Icons
    visuals/              generated project previews (small screens, reduced motion, modal)
  lib/
    drive.ts              scroll → road mapping, camera shots and colours per stop
    ...                   scroll helpers, pointer store, validation
public/models/            car.glb (CC BY 4.0, see CREDITS.md)
```

### The drive

The whole page sits over one fixed 3D world. Scrolling drives a car along a road, and every element with a `data-drive="<key>"` attribute is a stop on it.

- `src/lib/drive.ts` lists the stops. Each one has a distance along the road, a camera shot (position, target, field of view and where the car sits on screen), a separate shot for small screens, and sky colours. Edit a stop to reframe a section.
- The car follows the scroll position, and the camera follows with more weight. Wheels roll with the distance driven, the front wheels steer into bends, the body squats, dives and leans, and the brake lights come on as it slows.
- Skills are overhead road signs, each project is a set of phones showing its first three screenshots, Experience runs through a tunnel, and the contact form is projected onto a drive-in screen. Adding a project to `site.ts` extends the road automatically.
- **Motion** handles the tilting windows, word reveals, flip words, nav pill and modal. Text reveals are transform only.

### Performance and accessibility

- The 3D bundle loads with `next/dynamic` (`ssr: false`). The loader waits for the car, for 6 seconds at most.
- Everything repeated is instanced, project textures load as the car approaches, and the drei `PerformanceMonitor` lowers the pixel ratio when frame rate falls.
- Without WebGL, or if the scene fails, the page works over a plain gradient.
- Animations are transform- and opacity-based, and layouts reserve their space, so content doesn't shift.
- `prefers-reduced-motion` parks the car: the scene is a still frame, project cards show their own previews, and Lenis, the cursor, tilts and reveals are off.
- The page includes:
  - a skip link and visible focus rings
  - semantic landmarks and `aria-current` on the nav
  - a modal with focus handling and Escape to close
  - form errors announced through `role="alert"`
- The custom cursor only turns on for fine pointers. Touch devices keep native behaviour.
