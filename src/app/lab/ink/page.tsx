import type { Metadata } from "next";
import InkLab from "@/components/lab/InkLab";

export const metadata: Metadata = {
  title: "Ink mask — lab",
  robots: { index: false, follow: false },
};

export default function InkLabPage() {
  return <InkLab />;
}
