import { IntroProvider } from "@/components/providers/IntroProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { DriveStage } from "@/components/drive/DriveStage";
import { Cursor } from "@/components/ui/Cursor";
import { DriveHud } from "@/components/ui/DriveHud";
import { Loader } from "@/components/ui/Loader";
import { Nav } from "@/components/ui/Nav";
import { Hero } from "@/components/sections/Hero";
import { site } from "@/content/site";
import { About } from "@/components/sections/About";
import { Skills } from "@/components/sections/Skills";
import { Projects } from "@/components/sections/Projects";
import { Experience } from "@/components/sections/Experience";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <IntroProvider>
      <SmoothScroll />
      <Loader />
      <Cursor />
      <DriveStage />
      <Nav />
      {/* No z-index here: the project modal must be able to rise above the nav */}
      <main id="main" className="relative">
        <Hero />
        {/* Open road where the banner hangs over the highway */}
        {site.portrait && <div data-drive="banner" aria-hidden className="pointer-events-none h-[110svh] motion-reduce:hidden" />}
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Contact />
      </main>
      <Footer />
      <DriveHud />
    </IntroProvider>
  );
}
