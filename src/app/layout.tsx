import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import SmoothScroll from "@/components/site/SmoothScroll";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-ui",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bytesandpartners.co"),
  title: {
    default: "Bytes and Partners — We Build Intelligent Digital Experiences",
    template: "%s · Bytes and Partners",
  },
  description:
    "Bytes and Partners is a technology company creating AI-powered products, scalable web and mobile applications, CRM platforms and intelligent automation for businesses worldwide — engineered through its technology platform, BytesPlatform.",
  keywords: [
    "AI development studio",
    "AI agents",
    "AI automation",
    "web application development",
    "mobile app development",
    "CRM development",
    "SaaS product development",
    "custom software development",
    "digital transformation",
    "Bytes and Partners",
    "BytesPlatform",
  ],
  authors: [{ name: "Bytes and Partners" }],
  creator: "Bytes and Partners",
  publisher: "Bytes and Partners",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://bytesandpartners.co",
    siteName: "Bytes and Partners",
    title: "Bytes and Partners — We Build Intelligent Digital Experiences",
    description:
      "AI-powered products, scalable applications and intelligent systems — designed and engineered in-house.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bytes and Partners — We Build Intelligent Digital Experiences",
    description:
      "AI-powered products, scalable applications and intelligent systems — designed and engineered in-house.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#05060a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const ORG_JSONLD = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Bytes and Partners",
  legalName: "Bytes and Partners",
  alternateName: "Bytes & Partners",
  url: "https://bytesandpartners.co",
  description:
    "Technology studio building AI-powered products, web and mobile applications, CRM platforms and intelligent automation.",
  email: "info@bytesandpartners.co",
  telephone: "+1-631-388-9360",
  address: {
    "@type": "PostalAddress",
    streetAddress: "675 Hawkins Road East",
    addressLocality: "Coram",
    addressRegion: "NY",
    postalCode: "11727",
    addressCountry: "US",
  },
  areaServed: "Worldwide",
  brand: {
    "@type": "Brand",
    name: "BytesPlatform",
    description:
      "BytesPlatform is the technology platform and subsidiary of Bytes and Partners.",
  },
  subOrganization: {
    "@type": "Organization",
    name: "BytesPlatform",
    description:
      "Technology platform and subsidiary of Bytes and Partners, delivering AI products, web and mobile applications, CRM platforms and custom software.",
    parentOrganization: { "@type": "Organization", name: "Bytes and Partners" },
  },
  knowsAbout: [
    "Artificial Intelligence",
    "AI Agents",
    "Automation",
    "Web Application Development",
    "Mobile Application Development",
    "CRM Platforms",
    "SaaS",
    "Custom Software Development",
    "Digital Transformation",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="grain relative antialiased">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSONLD) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[99] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-[#06070b]"
        >
          Skip to content
        </a>
        <SmoothScroll />
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
