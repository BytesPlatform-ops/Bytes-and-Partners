import IntroExperience from "@/components/IntroExperience";
import FeaturedWork from "@/components/sections/FeaturedWork";

export default function HomePage() {
  return (
    <>
      <IntroExperience />
      <div
        data-services-dive-overlay
        aria-hidden
        className="pointer-events-none invisible fixed inset-0 z-[100] bg-blue opacity-0 [will-change:clip-path]"
      />
      <FeaturedWork />
    </>
  );
}
