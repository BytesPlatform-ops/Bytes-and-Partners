import Reveal from "./Reveal";
import type { ReactNode } from "react";

export default function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  id,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  id?: string;
}) {
  const center = align === "center";
  return (
    <header className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <Reveal>
        <div className={`flex items-center gap-3 ${center ? "justify-center" : ""}`}>
          <span className="h-px w-8 bg-gradient-to-r from-[#4d8dff] to-transparent" />
          <span className="eyebrow">{eyebrow}</span>
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <h2
          id={id}
          className="display mt-5 text-[clamp(2rem,4.6vw,3.5rem)] text-gradient"
        >
          {title}
        </h2>
      </Reveal>
      {lead && (
        <Reveal delay={0.16}>
          <p className={`mt-5 text-[1.0625rem] leading-relaxed text-titanium ${center ? "mx-auto" : ""}`}>
            {lead}
          </p>
        </Reveal>
      )}
    </header>
  );
}
