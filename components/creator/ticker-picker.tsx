"use client";

import { useEffect, useMemo, useState } from "react";
import type { TickerRow } from "@/lib/data/tickers";

const TOPIC_OPTIONS: TickerRow[] = [
  { id: "11111111-1111-4111-8111-111111111111", symbol: "BUILD", name: "Builders", exchange: null, country: null },
  { id: "22222222-2222-4222-8222-222222222222", symbol: "CREATE", name: "Creators", exchange: null, country: null },
  { id: "33333333-3333-4333-8333-333333333333", symbol: "GROW", name: "Growth", exchange: null, country: null },
  { id: "44444444-4444-4444-8444-444444444444", symbol: "COMM", name: "Community", exchange: null, country: null },
  { id: "55555555-5555-4555-8555-555555555555", symbol: "LEARN", name: "Learning", exchange: null, country: null },
];

export function TickerPicker({
  value,
  onChange,
  initialIds = [],
  disabled = false,
}: {
  value: TickerRow[];
  onChange: (items: TickerRow[]) => void;
  initialIds?: string[];
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (value.length > 0 || initialIds.length === 0) return;
    const mapped = TOPIC_OPTIONS.filter((topic) => initialIds.includes(topic.id));
    if (mapped.length > 0) onChange(mapped);
  }, [initialIds, onChange, value.length]);

  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOPIC_OPTIONS.filter((topic) =>
      !q ? true : topic.name.toLowerCase().includes(q) || topic.symbol.toLowerCase().includes(q),
    );
  }, [query]);

  function add(topic: TickerRow) {
    if (value.some((item) => item.id === topic.id)) return;
    onChange([...value, topic]);
  }

  function remove(id: string) {
    onChange(value.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Topics</label>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        disabled={disabled}
        placeholder="Search topics"
        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 placeholder:text-muted-foreground h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:opacity-50"
      />
      <ul className="flex flex-wrap gap-2">
        {options.map((topic) => (
          <li key={topic.id}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => add(topic)}
              className="bg-secondary text-secondary-foreground hover:bg-accent rounded-full px-3 py-1 text-xs disabled:opacity-50"
            >
              {topic.name}
            </button>
          </li>
        ))}
      </ul>
      {value.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {value.map((topic) => (
            <li key={topic.id}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => remove(topic.id)}
                className="rounded-full border px-3 py-1 text-xs"
              >
                {topic.name} ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

