import Link from "next/link";
import { Layers } from "lucide-react";
import { Container } from "@/components/layout/container";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="border-border/80 border-b py-4">
        <Container className="flex items-center justify-between">
          <Link href="/" className="text-foreground flex items-center gap-2 text-base font-bold">
            <div className="bg-primary text-primary-foreground flex h-7 w-7 items-center justify-center rounded-lg">
              <Layers className="h-4 w-4" />
            </div>
            <span>FlowPilot</span>
          </Link>
          <span className="text-muted-foreground text-xs">Architecture Auth Shell</span>
        </Container>
      </header>

      <main id="main-content" className="flex flex-1 items-center justify-center py-12">
        <Container size="sm" className="max-w-md">
          {children}
        </Container>
      </main>

      <footer className="text-muted-foreground py-6 text-center text-xs">
        <p>FlowPilot Multi-tenant Auth Boundary Verification</p>
      </footer>
    </div>
  );
}
