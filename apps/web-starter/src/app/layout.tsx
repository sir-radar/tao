import type { Metadata } from "next";
import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Explore Tokens | TAO", template: "%s | TAO" },
  description: "Explore TAO subnet token markets.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="dark"><body><Providers><a href="#main" className="fixed left-3 top-3 z-50 -translate-y-20 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:translate-y-0">Skip to content</a><div className="flex min-h-screen flex-col"><AppHeader />{children}<AppFooter /></div></Providers></body></html>;
}
