import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ScrollProgressBar } from "@/components/ui/scroll-progress-bar";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { AuroraBackground } from "@/components/ui/aurora-background";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScrollProvider>
      <div className="relative flex min-h-screen flex-col overflow-x-clip">
        {/* Subtle Living React Bits Aurora Canvas across all public marketing pages */}
        <AuroraBackground />

        {/* Executive Hardware-Accelerated Ambient Scroll Progress Bar */}
        <ScrollProgressBar />

        <Header />

        <main id="main-content" className="relative z-10 flex-1">
          {children}
        </main>

        <Footer />
      </div>
    </SmoothScrollProvider>
  );
}
