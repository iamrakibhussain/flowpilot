import Link from "next/link";
import { Layers } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-border/80 bg-background/95 sticky top-0 z-40 border-b backdrop-blur-xs">
        <Container className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-foreground flex items-center gap-2.5 text-lg font-bold tracking-tight"
            >
              <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg shadow-xs">
                <Layers className="h-5 w-5" />
              </div>
              <span>FlowPilot</span>
            </Link>
            <nav className="text-muted-foreground hidden items-center gap-6 text-sm font-medium md:flex">
              <Link href="/" className="hover:text-foreground transition">
                Architecture Foundation
              </Link>
              <Link href="/dashboard" className="hover:text-foreground transition">
                Dashboard Shell
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">Auth Shell</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/dashboard">Open Workspace</Link>
            </Button>
          </div>
        </Container>
      </header>

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <footer className="border-border/80 bg-surface text-muted-foreground border-t py-8 text-center text-xs">
        <Container>
          <p>FlowPilot Frontend Architecture Foundation — Multi-tenant Business Operations SaaS</p>
          <p className="mt-1">
            Separate Express REST API backend boundary defined. No production business features
            implemented.
          </p>
        </Container>
      </footer>
    </div>
  );
}
