import type { Metadata } from "next";
import { Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";

/* Poppins carries the existing brand equity (§8.3) and is capped at four
   weights — display 700/800, body 400/500. Note Poppins ships as static cuts
   on Google Fonts rather than a variable font, so this is four files, not one;
   it counts against the <180KB landing-route budget in §10.3. */
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
  preload: true,
});

/* Job-ticket typography: captions, stats, section labels, spec detail. */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cyan-group.com"),
  title: {
    default: "Branded Merchandise & Print Management | Cyan Group",
    template: "%s | Cyan Group",
  },
  description:
    "We run branded merchandise and print as one managed programme — sourcing, branding, storage, fulfilment and reporting. 25 years, ISO 9001 and 14001.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "Cyan Group",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body className={`${poppins.variable} ${geistMono.variable}`}>
        {/* Skip-to-content is a §10.4 requirement, not an enhancement. */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-cyan focus:px-4 focus:py-3 focus:text-16 focus:font-medium focus:text-black"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
