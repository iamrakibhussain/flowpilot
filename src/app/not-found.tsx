import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center py-16"
    >
      <Container size="sm" className="text-center">
        <div className="bg-muted text-muted-foreground mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
          <Compass className="h-8 w-8" aria-hidden="true" />
        </div>
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">404 Error</p>
        <h1 className="text-foreground mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Page not found
        </h1>
        <p className="text-muted-foreground mt-3 text-base">
          The requested page could not be located. It may have been moved or the URL might be
          incorrect.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </Container>
    </main>
  );
}
