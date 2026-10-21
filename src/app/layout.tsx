import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    template: "%s | FlowPilot",
    default: "FlowPilot — Service Business Operations Platform",
  },
  description:
    "One workspace to run a service business. FlowPilot unifies CRM, scheduling, invoicing, payments, and team operations.",
  keywords: [
    "service business",
    "business operations",
    "CRM",
    "scheduling",
    "invoicing",
    "multi-tenant SaaS",
  ],
  authors: [{ name: "FlowPilot Engineering" }],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f9fc" },
    { media: "(prefers-color-scheme: dark)", color: "#0d121c" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full antialiased ${plusJakartaSans.variable}`} suppressHydrationWarning>
      <body className="bg-background text-foreground selection:bg-primary/20 selection:text-primary font-sans flex min-h-full flex-col">
        <a
          href="#main-content"
          className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:px-4 focus:py-2 focus:shadow-md"
        >
          Skip to main content
        </a>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
