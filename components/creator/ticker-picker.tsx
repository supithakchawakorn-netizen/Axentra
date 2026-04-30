"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import {
  searchTickersAction,
  hydrateTickersAction,
} from "@/app/(creator)/studio/_actions/tickers";
import type { TickerRow } from "@/lib/data/tickers";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";

interface Props {
  value: TickerRow[];
  onChange: (next: TickerRow[]) => void;
  initialIds?: string[];
  max?: number;
  disabled?: boolean;
  label?: string;
  hint?: string;
}

export function TickerPicker({
  value,
  onChange,
  initialIds,
  max = 8,
  disabled,
  label = "Tickers",
  hint = "Tag up to 8 tickers covered in this content.",
}: Props) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<TickerRow[]>([]);
  const [open, setOpen] = useState(false);
  const lastQuery = useRef("");

  useEffect(() => {
    if (!initialIds || initialIds.length === 0) return;
    if (value.length > 0) return;
    let cancelled = false;
    void hydrateTickersAction({ ids: initialIds }).then((res) => {
      if (cancelled) return;
      if (res.ok) onChange(res.results);
    });
    return () => {
      cancelled = true;
    };
  }, [initialIds, onChange, value.length]);

  useEffect(() => {
    if (!open) return;
    if (q.trim().length === 0) {
      return;
    }
    const queryAt = q;
    lastQuery.current = queryAt;
    const t = setTimeout(async () => {
      const res = await searchTickersAction({ q: queryAt, limit: 8 });
      if (lastQuery.current !== queryAt) return;
      if (res.ok) {
        const filtered = res.results.filter(
          (r) => !value.some((v) => v.id === r.id),
        );
        setResults(filtered);
      } else {
        setResults([]);
      }
    }, 150);
    return () => clearTimeout(t);
  }, [q, open, value]);

  const visibleResults = q.trim().length > 0 ? results : [];

  const atMax = value.length >= max;

  function add(t: TickerRow) {
    if (atMax) return;
    onChange([...value, t]);
    setQ("");
    setResults([]);
  }
  function remove(id: string) {
    onChange(value.filter((t) => t.id !== id));
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor="ticker-search">{label}</Label>
      <div className="relative">
        <Input
          id="ticker-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          placeholder={atMax ? `Up to ${max} tickers` : "Search e.g. AAPL, NVDA"}
          disabled={disabled || atMax}
          autoComplete="off"
        />
        {open && visibleResults.length > 0 ? (
          <div className="bg-popover absolute z-10 mt-1 w-full overflow-hidden rounded-md border shadow-md">
            {visibleResults.map((r) => (
              <button
                key={r.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => add(r)}
                className={cn(
                  "hover:bg-accent flex w-full items-center justify-between px-3 py-2 text-left text-sm",
                )}
              >
                <span className="font-medium">{r.symbol}</span>
                <span className="text-muted-foreground ml-3 truncate text-xs">
                  {r.name}
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {value.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {value.map((t) => (
            <span
              key={t.id}
              className="bg-secondary text-secondary-foreground inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs"
            >
              {t.symbol}
              <button
                type="button"
                onClick={() => remove(t.id)}
                disabled={disabled}
                className="hover:text-foreground -mr-0.5 inline-flex items-center"
                aria-label={`Remove ${t.symbol}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
      <p className="text-muted-foreground text-xs">{hint}</p>
    </div>
  );
}
