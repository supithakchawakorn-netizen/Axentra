import { redirect } from "next/navigation";
import { SignInForm } from "@/components/auth/sign-in-form";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/env";
import { APP_NAME } from "@/lib/utils/site";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sign in",
  description: "Sign in to Varg Packs Studio.",
};

interface SignInPageProps {
  searchParams: Promise<{ next?: string; error?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/studio";

  if (supabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      redirect(next);
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2 text-center">
        <p className="text-muted-foreground text-xs uppercase tracking-widest">
          {APP_NAME} Studio
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Sign in to your creator account
        </h1>
        <p className="text-muted-foreground text-sm">
          Viewers don&apos;t need an account. This sign-in is for creators only.
        </p>
      </header>

      {!supabaseConfigured() ? (
        <div className="bg-muted text-muted-foreground rounded-md border p-4 text-sm">
          Supabase is not configured yet. Set{" "}
          <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and the
          anon / service role keys in <code className="font-mono">.env.local</code>{" "}
          to enable sign-in.
        </div>
      ) : (
        <SignInForm next={next} initialError={params.error ?? null} />
      )}
    </div>
  );
}
