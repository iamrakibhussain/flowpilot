import Link from "next/link";
import { Layers, ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";
import { Container } from "@/components/layout/container";
import { AuroraBackground } from "@/components/ui/aurora-background";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background text-foreground selection:bg-primary/20 selection:text-primary relative flex min-h-screen flex-col overflow-x-hidden">
      {/* Subtle Living Aurora Light Waves (Original FlowPilot background treatment) */}
      <AuroraBackground />

      {/* Soft Ambient Depth Flare behind Content Cards */}
      <div
        className="pointer-events-none fixed top-1/3 left-1/2 -z-10 h-[560px] w-[920px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-blue-500/[0.08] via-indigo-500/[0.06] to-cyan-400/[0.08] blur-[130px]"
        aria-hidden="true"
      />

      {/* Floating Glassmorphic Top Navigation Header */}
      <header className="border-border/70 sticky top-0 z-30 border-b bg-white/80 backdrop-blur-xl">
        <Container className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="group focus-visible:ring-primary flex items-center gap-2.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            aria-label="FlowPilot Home"
          >
            <div className="from-primary relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br via-blue-600 to-indigo-600 text-white shadow-[0_0_16px_rgba(49,95,232,0.35)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_24px_rgba(49,95,232,0.55)]">
              <Layers className="h-4.5 w-4.5" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-cyan-300 blur-[1px]" />
            </div>
            <div className="flex items-center">
              <span className="text-foreground text-base font-bold tracking-tight sm:text-lg">
                Flow
                <span className="from-primary bg-gradient-to-r via-blue-600 to-indigo-600 bg-clip-text font-extrabold text-transparent">
                  Pilot
                </span>
              </span>
              <span className="border-primary/20 bg-primary/10 text-primary ml-2 hidden items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase sm:inline-flex">
                <Sparkles className="h-2.5 w-2.5" />
                Workspaces
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to home</span>
            </Link>
          </div>
        </Container>
      </header>

      {/* Main Form Center Shell */}
      <main
        id="main-content"
        className="relative z-10 flex flex-1 items-center justify-center py-8 sm:py-12"
      >
        <Container
          size="fluid"
          className="flex w-full max-w-xl justify-center has-[[data-wide-auth]]:max-w-6xl"
        >
          {children}
        </Container>
      </main>

      {/* Enterprise Security Glass Footer */}
      <footer className="border-border/60 relative z-10 border-t bg-white/60 py-6 text-center text-xs backdrop-blur-md">
        <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4">
          <div className="text-foreground/90 flex items-center gap-1.5 font-medium">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Strict Multi-Tenant Scoping</span>
          </div>
          <span className="hidden sm:inline">•</span>
          <span>Argon2id Cryptographic Security</span>
          <span className="hidden sm:inline">•</span>
          <span>SOC2 Type II Ready</span>
        </div>
        <p className="text-muted-foreground/80 mt-2 text-[11px]">
          © 2026 FlowPilot Inc. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
