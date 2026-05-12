import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/profiles";
import { studioGuestModeEnabled, supabaseConfigured } from "@/lib/env";
import { APP_NAME } from "@/lib/utils/site";
import { StudioRouteDock } from "@/components/layout/studio-route-dock";
import { StudioModeBanner } from "@/components/layout/studio-mode-banner";
import { MarketTape } from "@/components/market/market-tape";
import { WolfpackLogoMark } from "@/components/layout/wolfpack-logo-mark";

// Studio is per-user. Never prerender at build time.
export const dynamic = "force-dynamic";

export default async function StudioLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (!supabaseConfigured()) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-xl font-semibold">{APP_NAME} Studio</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Supabase isn&apos;t configured yet. Set up the project (see README) and
          paste keys into <code>.env.local</code> to use Studio.
        </p>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const previewMode = !user && studioGuestModeEnabled();
  if (!user && !previewMode) {
    redirect("/sign-in?next=/studio");
  }
  const profile = user ? await getCurrentProfile() : null;

  return (
    <div className="bg-background min-h-screen">
      <header className="glass-panel sticky top-0 z-30 border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
          <Link href="/" className="inline-flex items-center gap-2 font-semibold tracking-tight">
            <WolfpackLogoMark className="h-6 min-w-6" />
            {APP_NAME}
          </Link>
          <span className="text-muted-foreground text-xs uppercase tracking-widest">
            Studio
          </span>
          {previewMode ? (
            <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-amber-200">
              Guest preview
            </span>
          ) : null}
          <div className="ml-auto flex items-center gap-3">
            {profile ? (
              <Link
                href={`/@${profile.handle}`}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                @{profile.handle}
              </Link>
            ) : null}
            {previewMode ? (
              <Link
                href="/sign-in?next=/studio"
                className="text-primary text-xs hover:underline underline-offset-4"
              >
                Sign in for publishing
              </Link>
            ) : null}
          </div>
        </div>
      </header>
      <div className="market-grid-bg">
        <StudioRouteDock />
      </div>
      <StudioModeBanner previewMode={previewMode} />
      <div className="mx-auto w-full max-w-6xl px-4 pt-3">
        <MarketTape compact />
      </div>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
