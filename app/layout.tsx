import type { Metadata, Viewport } from "next";
import { Outfit, Merriweather, Fira_Code } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import {
  JsonLd,
  webApplicationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";
import {
  absoluteUrl,
  getSiteUrl,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/site";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  style: ["normal", "italic"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_TAGLINE,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: absoluteUrl("/"),
    siteName: SITE_NAME,
    title: SITE_TAGLINE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/meta_image.png",
        width: 1200,
        height: 630,
        alt: "Find your number in the digits of π",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TAGLINE,
    description: SITE_DESCRIPTION,
    images: ["/meta_image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${merriweather.variable} ${firaCode.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <JsonLd data={[websiteJsonLd(), webApplicationJsonLd()]} />
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
