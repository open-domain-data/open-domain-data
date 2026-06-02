import type { Metadata } from "next";
import "@/styles/odc.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SITE } from "@/lib/data";

export const metadata: Metadata = {
  metadataBase: new URL(`https://${SITE.domain}`),
  title: {
    default: "Open Domain Data — Open datasets for domain infrastructure",
    template: "%s — Open Domain Data",
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  openGraph: {
    title: SITE.name,
    description: SITE.description,
    type: "website",
    siteName: SITE.name,
    url: `https://${SITE.domain}`,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="odc">
          <SiteHeader />
          {children}
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
