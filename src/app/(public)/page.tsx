import Link from "next/link";
import {
  CheckCircle2,
  ShieldCheck,
  Server,
  Palette,
  Terminal,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ArchitectureOverviewPage() {
  return (
    <div className="py-12 md:py-16">
      <Container>
        {/* Architecture Foundation Hero */}
        <div className="max-w-3xl space-y-4">
          <Badge variant="outline" className="gap-1.5 px-3 py-1 font-mono text-xs">
            <Sparkles className="text-primary h-3.5 w-3.5" />
            Engineering Foundation Completed
          </Badge>
          <h1 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            FlowPilot Frontend Architecture & Foundation
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            A production-oriented, multi-tenant Business Operations SaaS frontend foundation.
            Engineered with strict TypeScript, Next.js App Router, Tailwind CSS design tokens,
            accessible UI primitives, and a decoupled Express API boundary.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button asChild>
              <Link href="/dashboard">
                Explore Dashboard Shell <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">Explore Auth Validation Form</Link>
            </Button>
          </div>
        </div>

        {/* Foundation Status Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-semibold">Strict Typing & Quality</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                TypeScript strict checking, ESLint 9 flat config, Prettier formatting, and Vitest
                unit testing configured with zero any tolerance.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
                <Palette className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-semibold">Tokenized Design System</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Tailwind CSS v4 semantic tokens for Canvas, Surface, Primary (#315FE8), Success,
                Warning, and Danger with dark mode readiness.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
                <Server className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-semibold">Decoupled API Boundary</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Typed HTTP client with timeout management, normalized error models, TanStack Query
                client, and organization context header support.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
                <Terminal className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-semibold">Complete Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                10 architecture specifications in <code>/docs/</code> detailing security, UX states,
                API contracts, accessibility, and roadmaps.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Design System Token Swatches */}
        <div className="border-border bg-card mt-12 rounded-lg border p-6 shadow-xs">
          <h2 className="text-foreground text-lg font-bold">Design System Color Tokens</h2>
          <p className="text-muted-foreground mt-1 text-xs">
            Curated B2B SaaS palette meeting WCAG 2.2 contrast standards.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            <div className="border-border rounded-md border p-3">
              <div className="bg-primary h-8 rounded" />
              <p className="mt-2 text-xs font-semibold">Primary</p>
              <p className="text-muted-foreground font-mono text-[10px]">#315FE8</p>
            </div>
            <div className="border-border rounded-md border p-3">
              <div className="bg-foreground h-8 rounded" />
              <p className="mt-2 text-xs font-semibold">Primary Text</p>
              <p className="text-muted-foreground font-mono text-[10px]">#172033</p>
            </div>
            <div className="border-border rounded-md border p-3">
              <div className="bg-background border-border h-8 rounded border" />
              <p className="mt-2 text-xs font-semibold">Canvas</p>
              <p className="text-muted-foreground font-mono text-[10px]">#F7F9FC</p>
            </div>
            <div className="border-border rounded-md border p-3">
              <div className="bg-surface border-border h-8 rounded border" />
              <p className="mt-2 text-xs font-semibold">Surface</p>
              <p className="text-muted-foreground font-mono text-[10px]">#FFFFFF</p>
            </div>
            <div className="border-border rounded-md border p-3">
              <div className="bg-border h-8 rounded" />
              <p className="mt-2 text-xs font-semibold">Border</p>
              <p className="text-muted-foreground font-mono text-[10px]">#E1E7F0</p>
            </div>
            <div className="border-border rounded-md border p-3">
              <div className="bg-success h-8 rounded" />
              <p className="mt-2 text-xs font-semibold">Success</p>
              <p className="text-muted-foreground font-mono text-[10px]">#16856B</p>
            </div>
            <div className="border-border rounded-md border p-3">
              <div className="bg-warning h-8 rounded" />
              <p className="mt-2 text-xs font-semibold">Warning</p>
              <p className="text-muted-foreground font-mono text-[10px]">#B7791F</p>
            </div>
            <div className="border-border rounded-md border p-3">
              <div className="bg-destructive h-8 rounded" />
              <p className="mt-2 text-xs font-semibold">Danger</p>
              <p className="text-muted-foreground font-mono text-[10px]">#C2414B</p>
            </div>
          </div>
        </div>

        {/* Scope Boundary Declaration */}
        <div className="border-primary/20 bg-primary/5 text-foreground mt-8 rounded-lg border p-6 text-sm">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="text-primary mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <h3 className="text-foreground font-semibold">Scope Boundary Notice</h3>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                As specified by the architecture master prompt, this project contains the complete
                engineering foundation and design system. No production business features (such as
                actual appointment booking, customer databases, or real invoice payments) have been
                created yet, preserving clean domain boundaries for future development against the
                upcoming
                <code>flowpilot-backend</code> Express REST service.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
