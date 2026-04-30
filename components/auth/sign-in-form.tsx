"use client";

import { useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  signInWithEmail,
  signInWithGoogle,
} from "@/app/(auth)/sign-in/_actions";

interface SignInFormProps {
  next: string;
  initialError: string | null;
}

export function SignInForm({ next, initialError }: SignInFormProps) {
  const params = useSearchParams();
  const sent = params.get("sent") === "1";
  const error = params.get("error") ?? initialError;
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      {error ? (
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
          {error}
        </div>
      ) : null}

      {sent ? (
        <div className="border-primary/30 bg-primary/10 rounded-md border px-3 py-2 text-sm">
          Check your inbox for a magic-link email.
        </div>
      ) : null}

      <form
        action={(fd) => startTransition(() => signInWithGoogle(fd))}
        className="space-y-2"
      >
        <input type="hidden" name="next" value={next} />
        <Button
          type="submit"
          variant="outline"
          className="w-full"
          disabled={isPending}
        >
          Continue with Google
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-muted-foreground text-xs uppercase tracking-wider">
          or
        </span>
        <Separator className="flex-1" />
      </div>

      <form
        action={(fd) => startTransition(() => signInWithEmail(fd))}
        className="space-y-3"
      >
        <input type="hidden" name="next" value={next} />
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          Email me a magic link
        </Button>
      </form>
    </div>
  );
}
