import Hero from "@/components/hero/Hero";
import Marquee from "@/components/sections/Marquee";
import Services from "@/components/sections/Services";
import Work from "@/components/sections/Work";
import IntelligenceLayer from "@/components/sections/IntelligenceLayer";
import Process from "@/components/sections/Process";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";

export default function HomePage() {
  return (
    <>
      <span id="top" />
      <Hero />
      <Marquee />
      <Services />
      <Work />
      <IntelligenceLayer />
      <Process />
      <About />
      <Contact />
    </>
  );
}
