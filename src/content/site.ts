/**
 * ─────────────────────────────────────────────────────────────
 *  ALL EDITABLE CONTENT LIVES HERE.
 *  Anything wrapped in [SQUARE BRACKETS] is a placeholder —
 *  search this file for "[" and replace each one with real info.
 * ─────────────────────────────────────────────────────────────
 */

export const site = {
  name: "[YOUR NAME]",
  /** Short form used by the logo mark, e.g. initials. */
  initials: "[YN]",
  role: "Flutter Developer | Mobile Engineer",
  headline: "Building Digital Experiences That Feel Different.",
  intro:
    "I build beautiful, scalable, and meaningful digital products through thoughtful engineering and creative problem-solving.",
  location: "[YOUR CITY, COUNTRY]",
  availability: "[Open to internships & full-time roles]",
  email: "[your.email@example.com]",
  /** Put your resume at /public/resume.pdf (or change this path). */
  resumeUrl: "/resume.pdf",
  socials: {
    github: "https://github.com/[your-username]",
    linkedin: "https://www.linkedin.com/in/[your-username]",
    instagram: "https://www.instagram.com/[your-username]",
  },
  seo: {
    title: "[YOUR NAME] — Flutter Developer & Mobile Engineer",
    description:
      "Portfolio of [YOUR NAME], a Flutter developer and mobile engineer building beautiful, scalable applications with clean architecture.",
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

export type Project = {
  id: "netguard" | "carelink" | "affirm";
  index: string;
  name: string;
  tagline: string;
  description: string;
  details: string[];
  stack: string[];
  category: string;
  year: string;
  github: string;
  demo: string;
  /** Optional screenshot path in /public, e.g. "/projects/netguard.jpg". Overrides the generated visual. */
  image?: string;
  accent: string;
};

export const projects: Project[] = [
  {
    id: "netguard",
    index: "01",
    name: "Netguard AI",
    tagline: "Predicting telecom network faults before they happen.",
    description:
      "An AI-powered telecom network fault prediction and predictive maintenance platform that learns from network telemetry to flag likely failures early.",
    details: [
      "[Describe the data you trained on and how it was prepared.]",
      "[Describe the XGBoost model, features and evaluation approach.]",
      "[Describe how predictions are surfaced through the Django app.]",
    ],
    stack: ["Python", "Django", "Machine Learning", "XGBoost"],
    category: "AI · Predictive Maintenance",
    year: "[YEAR]",
    github: "https://github.com/[your-username]/[netguard-repo]",
    demo: "[LIVE DEMO URL]",
    accent: "#5be9ff",
  },
  {
    id: "carelink",
    index: "02",
    name: "CareLink",
    tagline: "Connecting donors with the NGOs that need them.",
    description:
      "A donation-focused Android application that connects donors with NGOs, with realtime updates powered by Firebase.",
    details: [
      "[Describe the donor and NGO flows you designed.]",
      "[Describe how Firebase Realtime Database keeps data in sync.]",
      "[Describe a challenge you solved and what you learned.]",
    ],
    stack: ["Kotlin", "Android", "Firebase Realtime Database"],
    category: "Mobile · Social Impact",
    year: "[YEAR]",
    github: "https://github.com/[your-username]/[carelink-repo]",
    demo: "[LIVE DEMO URL]",
    accent: "#8b7bff",
  },
  {
    id: "affirm",
    index: "03",
    name: "Affirm",
    tagline: "[ONE-LINE TAGLINE FOR AFFIRM]",
    description:
      "[Short description of Affirm: what it does, who it is for, and why you built it.]",
    details: [
      "[Key feature or technical highlight #1.]",
      "[Key feature or technical highlight #2.]",
      "[Key feature or technical highlight #3.]",
    ],
    stack: ["[TECH 1]", "[TECH 2]", "[TECH 3]"],
    category: "[CATEGORY]",
    year: "[YEAR]",
    github: "https://github.com/[your-username]/[affirm-repo]",
    demo: "[LIVE DEMO URL]",
    accent: "#4f8bff",
  },
];

export type ExperienceEntry = {
  role: string;
  org: string;
  period: string;
  type: string;
  summary: string;
  points: string[];
  tags: string[];
};

export const experience: ExperienceEntry[] = [
  {
    role: "[Your Internship Role, e.g. Flutter Developer Intern]",
    org: "[Company Name]",
    period: "[Start Month YYYY] — Present",
    type: "Internship · Current",
    summary: "[One sentence on what the team builds and your part in it.]",
    points: [
      "[Responsibility or contribution #1]",
      "[Responsibility or contribution #2]",
      "[Measurable outcome, only if real]",
    ],
    tags: ["[Tech]", "[Tech]", "[Tech]"],
  },
  {
    role: "Flutter Developer",
    org: "[Company / Freelance / Personal Projects]",
    period: "[Start — End]",
    type: "Mobile Development",
    summary: "[Describe the Flutter apps you built and the context.]",
    points: [
      "[e.g. Structured features with Clean Architecture and BLoC]",
      "[e.g. Integrated REST APIs using Dio with GetIt / Injectable DI]",
      "[Another contribution]",
    ],
    tags: ["Flutter", "Dart", "BLoC", "Dio"],
  },
  {
    role: "Vice President",
    org: "DevUp",
    period: "[Start — End]",
    type: "Technical Club · Leadership",
    summary: "[Describe DevUp and your role leading the technical club.]",
    points: [
      "[Events, workshops or initiatives you led]",
      "[How you supported members or grew the community]",
      "[Another responsibility]",
    ],
    tags: ["Leadership", "Community", "Mentoring"],
  },
];
