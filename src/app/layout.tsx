import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const APP_URL = "https://www.reportlyapps.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Reportly — AI Client Reports for Marketing Agencies",
    template: "%s | Reportly",
  },
  description:
    "Generate polished, branded marketing reports for clients in under 60 seconds. Connect Google Analytics 4, let AI write the narrative, and send a PDF or share link. 14-day free trial.",
  keywords: [
    "AI client reports",
    "marketing agency reporting tool",
    "automated client reports",
    "Google Analytics reporting",
    "agency report generator",
    "AI marketing reports",
    "client reporting software",
    "automated marketing reports",
    "agency dashboard",
    "GA4 reporting tool",
  ],
  authors: [{ name: "Reportly" }],
  creator: "Reportly",
  publisher: "Reportly",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: "Reportly",
    title: "Reportly — AI Client Reports in 60 Seconds",
    description:
      "Stop spending hours on client reports. Connect GA4, click generate — Claude writes the narrative, charts, and insights. Send a branded PDF or share link instantly.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Reportly — AI-powered client reports for marketing agencies",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Reportly — AI Client Reports in 60 Seconds",
    description:
      "Stop spending hours on client reports. Connect GA4, click generate — Claude writes the narrative, charts, and insights.",
    images: ["/og-image.png"],
    creator: "@reportlyapp",
  },
  alternates: {
    canonical: APP_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <head>
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Reportly",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              description:
                "AI-powered marketing report generator for agencies and freelancers. Connect Google Analytics 4 and generate branded client reports in under 60 seconds.",
              url: APP_URL,
              offers: {
                "@type": "Offer",
                price: "8",
                priceCurrency: "USD",
                priceSpecification: {
                  "@type": "UnitPriceSpecification",
                  price: "8",
                  priceCurrency: "USD",
                  unitText: "MONTH",
                },
              },
              featureList: [
                "AI-generated report narratives",
                "Google Analytics 4 integration",
                "Branded PDF export",
                "Public share links",
                "Email delivery to clients",
              ],
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.9",
                ratingCount: "127",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
