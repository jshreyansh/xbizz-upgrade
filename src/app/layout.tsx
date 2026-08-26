import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Figtree } from "next/font/google";
import { Providers } from "@/app/providers";
import "./globals.css";

/** Single source of truth for app typography — globals.css consumes
 *  this via --font-figtree. Load it once here rather than per-component
 *  so every page renders the same typeface instead of silently falling
 *  back to the OS system font. */
const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SwishX — Content Studio",
  description: "Evidence-native creative production for life sciences.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={figtree.variable}>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
