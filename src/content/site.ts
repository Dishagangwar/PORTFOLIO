/**
 * ─────────────────────────────────────────────────────────────
 *  ALL EDITABLE CONTENT LIVES HERE.
 *  Anything wrapped in [SQUARE BRACKETS] is a placeholder —
 *  search this file for "[" and replace each one with real info.
 * ─────────────────────────────────────────────────────────────
 */

export const site = {
  name: "Disha Gangwar",
  /** Short form used by the logo mark, e.g. initials. */
  initials: "DG",
  role: "Flutter Developer | Mobile Engineer",
  headline: "Building Digital Experiences That Feel Different.",
  intro:
    "I build beautiful, scalable, and meaningful digital products through thoughtful engineering and creative problem-solving.",
  location: "Delhi, India",
  availability: "[Open to internships & full-time roles]",
  email: "dg1319.disha@gmail.com",
  /**
   * Full-screen hero background photo, shown under a black overlay with floating particles.
   * Set to "" to use the 3D scene instead (portrait or abstract object, below).
   */
  heroBackground: "/hero/hero-portrait.webp",
  /**
   * Cut-out portrait for the 3D scene (only used when heroBackground is "").
   * Set to "" as well to show the original abstract 3D object.
   */
  heroPortrait: "/hero/portrait.webp",
  /** Put your resume at /public/resume.pdf (or change this path). */
  resumeUrl: "/resume.pdf",
  socials: {
    github: "https://github.com/Dishagangwar",
    linkedin: "https://www.linkedin.com/in/disha-gangwar-526806280",
    instagram: "https://www.instagram.com/dishuforfam/",
  },
  seo: {
    title: "Disha Gangwar — Flutter Developer & Mobile Engineer",
    description:
      "Portfolio of Disha Gangwar, a Flutter developer and mobile engineer building beautiful, scalable applications with clean architecture.",
    url: "https://[your-domain].com",
  },
} as const;

export const navItems = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
] as const;

export type SectionId = (typeof navItems)[number]["id"];

/** Technologies that orbit the 3D object in the hero. */
export const heroOrbit = [
  "Flutter",
  "Dart",
  "Kotlin",
  "Firebase",
  "BLoC",
  "Go",
  "Django",
  "PostgreSQL",
];

export const about = {
  /** Subtle darkened photo behind the About section. Set to "" to remove it. */
  photo: "",
  lead: "I'm a mobile engineer who treats every screen as a product, and every line of code as part of a system that has to last.",
  paragraphs: [
    "I work primarily with Flutter and Dart, building cross-platform apps that feel native, fluid and intentional. Mobile is where software meets people at their most personal, and I find that endlessly motivating.",
    "Under the surface, I care about architecture: Clean Architecture boundaries, MVVM, BLoC and Provider for predictable state, GetIt and Injectable for dependency injection, and well-typed REST integrations with Dio. Scalable apps are the ones that stay easy to change.",
    "Beyond mobile, I explore backend development with Django, Go and PostgreSQL, and I'm increasingly drawn to integrating AI/ML into real products, where models become features people actually use.",
  ],
  principles: [
    {
      title: "Craft the feeling",
      body: "Motion, rhythm and feedback are part of the product, not polish added at the end.",
    },
    {
      title: "Architect for change",
      body: "Clear layers, explicit dependencies and testable units, so features ship without fear.",
    },
    {
      title: "Stay curious",
      body: "From Go services to ML models, I learn by building and bring that back to the apps.",
    },
  ],
};

export type SkillCategory = {
  id: string;
  title: string;
  blurb: string;
  items: string[];
};

export const skillCategories: SkillCategory[] = [
  {
    id: "mobile",
    title: "Mobile Development",
    blurb: "Cross-platform and native apps that feel fast and personal.",
    items: ["Flutter", "Dart", "Kotlin", "Android Studio"],
  },
  {
    id: "architecture",
    title: "State & Architecture",
    blurb: "Predictable state and layered codebases built to scale.",
    items: ["BLoC", "Provider", "MVVM", "Clean Architecture"],
  },
  {
    id: "backend",
    title: "Backend Development",
    blurb: "APIs and data layers that power the experience.",
    items: ["Django", "Go", "REST APIs", "PostgreSQL"],
  },
  {
    id: "tools",
    title: "Tools & Integration",
    blurb: "The glue: services, networking, DI and collaboration.",
    items: ["Firebase", "Dio", "GetIt", "Injectable", "Git", "GitHub"],
  },
];

/** Shown as a quiet secondary row under the ecosystem. */
export const alsoExploring = ["Python", "AI/ML Integration", "API Development"];

/* ─────────────────────────── PROJECTS ───────────────────────────
 * Two showcases: Flutter & Dart first, then Kotlin & XML.
 * Only technologies implied by each category are pre-filled; add the rest
 * (Firebase, BLoC, REST APIs, Room…) once you confirm what each app uses.
 * Any "[PLACEHOLDER]" stack entry renders as a dashed chip until replaced.
 */
export type Project = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  /** Bullet points shown in the "View Project" panel. */
  details: string[];
  stack: string[];
  year: string;
  github: string;
  /** Live demo / Play Store URL. Set to "" to hide the button for apps without one. */
  demo: string;
  /** Button text for the demo link, e.g. "Video Demo" or "Download APK". Defaults to "Live Demo". */
  demoLabel?: string;
  /** Optional release status shown as a small pill, e.g. "In testing on Google Play". */
  status?: string;
  /**
   * Portrait app screenshots in /public, e.g. ["/projects/medsagar-1.png", "/projects/medsagar-2.png"].
   * The first 3 are shown inside the device frames (first = front); all of them appear in the
   * "View Project" gallery. Until set, a styled placeholder device is shown.
   */
  screenshots?: string[];
};

export type ProjectCategory = {
  id: "flutter" | "kotlin";
  index: string;
  label: string;
  title: string;
  description: string;
  /** Short tags shown beside the category heading. */
  platforms: string[];
  accent: string;
  /** Visual treatment of the device previews. */
  device: "cross-platform" | "android";
  projects: Project[];
};

export const projectCategories: ProjectCategory[] = [
  {
    id: "flutter",
    index: "01",
    label: "Flutter & Dart",
    title: "Crafting cross-platform experiences with Flutter.",
    description:
      "One codebase, native feel on every screen. These apps are where I sweat the details: fluid UI, solid state management and clean architecture.",
    platforms: ["Android", "iOS", "Cross-platform"],
    accent: "#5be9ff",
    device: "cross-platform",
    projects: [
      {
        id: "medsagar",
        name: "Medsagar",
        tagline: "Healthcare Consultation Platform",
        description:
          "A healthcare consultation platform supporting patient, doctor, and clinic accounts, with appointments, consultations, a wallet, and secure in-app payments.",
        details: [
          "Developed a healthcare platform supporting patient, doctor, and clinic accounts.",
          "Implemented REST APIs for appointments, consultations, wallet, and user management.",
          "Integrated Firebase OTP authentication and Google OAuth with role-based access control.",
          "Integrated Razorpay to enable secure in-app payment transactions.",
        ],
        stack: ["Flutter", "Dart", "REST APIs", "Firebase Authentication", "Google OAuth", "Razorpay"],
        year: "Mar – Apr 2026",
        github: "https://github.com/[your-username]/[medsagar-repo]",
        demo: "https://drive.google.com/file/d/158Uzbjj1sFg5zatTfTzF_VlQcCfJ306-/view?usp=sharing",
        demoLabel: "Video Demo",
        // First = front device; second and third sit behind it.
        screenshots: ["/projects/medsagar-home.png", "/projects/medsagar-role.png", "/projects/medsagar-login.png"],
      },
      {
        id: "namaste-tripathi",
        name: "Namaste Tripathi",
        tagline: "Multi-Service Super App Platform",
        description:
          "A multi-domain super app bringing restaurants, hotels, delivery, and service providers together, with dedicated Admin, Service Provider, and Delivery Partner dashboards.",
        details: [
          "Developed a multi-domain platform for restaurants, hotels, delivery, and service providers.",
          "Implemented Admin, Service Provider, and Delivery Partner dashboards.",
          "Built scalable and responsive UI using Flutter with structured navigation.",
        ],
        stack: ["Flutter", "Dart", "[Add tech]"],
        year: "Mar – Apr 2026",
        github: "https://github.com/[your-username]/[namaste-tripathi-repo]",
        demo: "https://drive.google.com/file/d/1xvoPfMiDbAcCyXFPlXC4w6chXzVOjZIU/view?usp=share_link",
        demoLabel: "Video Demo",
        screenshots: [
          // First 3 appear in the device frames
          "/projects/namaste-tripathi-home.png",
          "/projects/namaste-tripathi-restaurant.webp",
          "/projects/namaste-tripathi-providers.webp",
          // Food ordering flow
          "/projects/namaste-tripathi-payment.png",
          "/projects/namaste-tripathi-order-placed.webp",
          // Hotel booking flow
          "/projects/namaste-tripathi-booking.png",
          "/projects/namaste-tripathi-booking-confirmed.webp",
          // Real estate
          "/projects/namaste-tripathi-schedule-visit.png",
          // Bike services sign-in
          "/projects/namaste-tripathi-bike.webp",
          "/projects/namaste-tripathi-otp.png",
        ],
      },
      {
        id: "emostate",
        name: "Emostate",
        tagline: "On-device emotional check-ins",
        description:
          "A Flutter app where you write a short journal entry and add a little context, get an on-device read of your emotional state with a suggested practice, and can save your check-ins to a private Supabase history.",
        details: [
          "Write a short journal entry and add context such as stress, energy, sleep, and time of day.",
          "Get an on-device read of your emotional state, paired with a suggested practice.",
          "Guided practices include box breathing, focus sprints, 5-4-3-2-1 grounding, and soundscapes.",
          "Save check-ins to a private Supabase history and see how your state changes over time.",
        ],
        stack: ["Flutter", "Dart", "Supabase", "On-device ML", "[Add tech]"],
        year: "Aug – Sep 2026",
        github: "https://github.com/Dishagangwar/Emotional_Intelligence_System",
        demo: "https://drive.google.com/file/d/1TwMpew7F3bP5Ciq40kzfgFKGVV27oAcZ/view?usp=drivesdk",
        demoLabel: "App Demo",
        screenshots: [
          // First 3 appear in the device frames
          "/projects/emostate-checkin.png",
          "/projects/emostate-history.png",
          "/projects/emostate-grounding.png",
          // Practice exercises
          "/projects/emostate-focus-sprint.png",
          "/projects/emostate-box-breathing.png",
          // Insights & account
          "/projects/emostate-insights-locked.png",
          "/projects/emostate-sign-in.png",
        ],
      },
      {
        id: "eco-track-pro",
        name: "Eco Track Pro",
        tagline: "AI-Powered Sustainability Platform",
        description:
          "A Flutter app that turns everyday habits into a live carbon-footprint score, with a Gemini-powered chatbot and image scanner for personalised sustainability advice.",
        details: [
          "Log daily habits across transportation, electricity, water, food, and waste & recycling.",
          "Turns those habits into a live carbon-footprint score and eco score on the dashboard.",
          "Gemini-powered EcoBot answers questions about sustainability, recycling, and reducing your footprint.",
          "Image scanner assesses appliances and food items and suggests eco-friendly alternatives.",
        ],
        stack: [
          "Flutter",
          "Dart",
          "Provider",
          "Firebase Auth",
          "Cloud Firestore",
          "Firebase Messaging",
          "Gemini 2.5 Flash",
          "flutter_local_notifications",
        ],
        year: "Jan – Feb 2026",
        github: "https://github.com/Dishagangwar/ecotrack_pro",
        demo: "https://drive.google.com/file/d/1vzUzThFd85SLKVuY5kL4Pp6a-ok2N18c/view?usp=drivesdk",
        demoLabel: "App Demo",
        screenshots: [
          // First 3 appear in the device frames
          "/projects/eco-track-pro-dashboard.png",
          "/projects/eco-track-pro-ecobot.png",
          "/projects/eco-track-pro-login.png",
          // Onboarding
          "/projects/eco-track-pro-welcome.png",
          // Track daily habits
          "/projects/eco-track-pro-track-habits.png",
          "/projects/eco-track-pro-transportation.png",
          "/projects/eco-track-pro-food-habits.png",
          // Scan & check
          "/projects/eco-track-pro-scan.png",
          "/projects/eco-track-pro-scan-result.webp",
          // Eco-Bot conversation
          "/projects/eco-track-pro-ecobot-chat.webp",
        ],
      },
    ],
  },
  {
    id: "kotlin",
    index: "02",
    label: "Kotlin & XML",
    title: "Building native Android experiences with Kotlin.",
    description:
      "Close to the platform: Kotlin, XML layouts and the Android SDK, building apps that respect how Android is meant to feel.",
    platforms: ["Android", "Native"],
    accent: "#8b7bff",
    device: "android",
    projects: [
      {
        id: "instant-mechanic",
        name: "Instant Mechanic",
        tagline: "Vehicle Service Booking App",
        description:
          "An Android app to discover nearby mechanics, compare services, and book vehicle repairs, built on MVVM with Hilt, Coroutines, and Supabase.",
        details: [
          "Developed an Android app to discover nearby mechanics, compare services, and book vehicle repairs.",
          "Implemented MVVM and Repository architecture with Hilt dependency injection.",
          "Used Coroutines, Flow, and Jetpack Navigation for asynchronous operations and app navigation.",
          "Integrated Retrofit, OkHttp, and Moshi with mock and live API support.",
        ],
        // The first 5 show on the card; the rest appear in "View Project".
        stack: [
          "Kotlin",
          "Android SDK",
          "MVVM",
          "Hilt",
          "Supabase",
          "XML",
          "Coroutines",
          "Flow",
          "Jetpack Navigation",
          "Retrofit",
          "OkHttp",
          "Moshi",
        ],
        year: "Jul – Aug 2026",
        github: "https://github.com/Dishagangwar/Mechanic-Service-App",
        demo: "https://drive.google.com/file/d/1RIYtrOKnrel56mktIv-YEkscuZWx7pgw/view?usp=drivesdk",
        demoLabel: "App Demo",
        // Remove `status` once the app is live on Google Play.
        status: "In testing on Google Play",
        screenshots: [
          // First 3 appear in the device frames
          "/projects/instant-mechanic-home.png",
          "/projects/instant-mechanic-garage-detail.png",
          "/projects/instant-mechanic-login.png",
          // Booking flow
          "/projects/instant-mechanic-request-service.png",
          "/projects/instant-mechanic-request-sent.png",
          // Garage owner view
          "/projects/instant-mechanic-my-garage.png",
        ],
      },
      {
        id: "vidcollage",
        name: "Vidcollage",
        tagline: "On-Device Face Recognition and Video Collage App",
        description:
          "An Android app that finds every unique person in a video and renders a shareable collage with per-person appearance counts, using a fully on-device ML pipeline with no backend or network calls.",
        details: [
          "Built an Android app (Kotlin, MVVM) that identifies every unique person in a video and renders a shareable 1080×1920 collage with per-person appearance counts.",
          "Implemented a fully on-device ML pipeline: ML Kit face detection, FaceNet (TensorFlow Lite) 128-D embeddings, and agglomerative clustering, with no backend or network calls.",
          "Calibrated identity and blur thresholds from measured embedding-separation data and added cannot-link constraints so co-occurring faces are never merged.",
        ],
        // The first 5 show on the card; the rest appear in "View Project".
        stack: ["Kotlin", "ML Kit", "TensorFlow Lite", "FaceNet", "MVVM", "Android SDK", "XML"],
        year: "Sep 2026",
        github: "https://github.com/Dishagangwar/Vidcollage",
        demo: "https://drive.google.com/file/d/1FUWWZXYdHFegy7MJa0l6AG_b75eWRJiF/view?usp=drivesdk",
        demoLabel: "App Demo",
        screenshots: [
          "/projects/vidcollage-collage-blurred.webp",
          "/projects/vidcollage-results-blurred.webp",
          "/projects/vidcollage-home.png",
        ],
      },
    ],
  },
];

export type ExperienceEntry = {
  role: string;
  org: string;
  /** Optional, e.g. "Aug 2025 — Present". Hidden when omitted. */
  period?: string;
  type: string;
  /** Optional one-line context shown under the company name. */
  summary?: string;
  points: string[];
  tags: string[];
};

export const experience: ExperienceEntry[] = [
  {
    role: "Flutter Developer",
    org: "Mobile Monks",
    period: "Apr 2026 — Present",
    type: "Remote · Current",
    points: [
      "Developing scalable cross-platform mobile applications using Flutter and Dart.",
      "Building responsive UI components and implementing reusable architecture patterns.",
      "Integrating REST APIs, authentication systems, and third-party services into production applications.",
      "Collaborating with team members using Git-based workflows and agile development practices.",
    ],
    tags: ["Flutter", "Dart", "REST APIs", "Git", "Agile"],
  },
  {
    role: "Flutter Developer Intern",
    org: "HOOC AI Technologies Pvt. Ltd.",
    period: "Feb 2026 — Mar 2026",
    type: "Internship · Remote",
    points: [
      "Developed cross-platform mobile applications using Flutter and Dart.",
      "Followed best practices in code structure, Git-based version control, and API integration.",
    ],
    tags: ["Flutter", "Dart", "Git", "API Integration"],
  },
  {
    role: "Vice President",
    org: "DevUp Technical Club",
    type: "Technical Club · Leadership",
    points: [
      "Mentored students in programming and application development.",
      "Organized technical events and workshops.",
    ],
    tags: ["Leadership", "Mentoring", "Workshops"],
  },
];
