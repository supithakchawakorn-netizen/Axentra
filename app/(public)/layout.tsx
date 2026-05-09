import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { PublicSidebar } from "@/components/layout/public-sidebar";
import { RouteDock } from "@/components/layout/route-dock";
import { DemoModeBanner } from "@/components/shared/demo-mode-banner";
import { ViewModeExperiment } from "@/components/experiments/view-mode-experiment";
import { MarketTape } from "@/components/market/market-tape";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <ViewModeExperiment />
      <SiteHeader />
      <div className="market-grid-bg border-b">
        <RouteDock />
      </div>
      <DemoModeBanner />
      <div className="mx-auto w-full max-w-[1400px] px-2 pt-3 sm:px-4">
        <MarketTape compact />
      </div>
      <div className="mx-auto flex w-full max-w-[1400px] flex-1 gap-6 px-2 sm:px-4">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 self-start overflow-y-auto lg:block">
          <PublicSidebar />
        </aside>
        <div className="min-w-0 flex-1 pb-16 lg:pb-0">{children}</div>
      </div>
      <SiteFooter />
      <MobileBottomNav />
    </div>
  );
}
