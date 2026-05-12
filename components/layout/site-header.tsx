import { APP_NAME } from "@/lib/utils/site";
import { SiteHeaderDesktop } from "@/components/layout/site-header-desktop";
import { SiteHeaderMobile } from "@/components/layout/site-header-mobile";

export function SiteHeader() {
  return (
    <header className="bg-background/90 premium-surface sticky top-0 z-40 w-full border-b backdrop-blur-xl">
      <p className="sr-only">{APP_NAME} header</p>
      <SiteHeaderMobile />
      <SiteHeaderDesktop />
    </header>
  );
}
