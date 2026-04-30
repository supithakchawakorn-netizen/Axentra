"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  connectBrokerage,
  disconnectBrokerage,
  refreshBrokerage,
  setBrokerVisibility,
} from "@/app/(creator)/studio/broker/_actions";
import { StatusPill } from "@/components/shared/status-pill";

interface Props {
  connectionId: string | null;
  status: string | null;
  initialVisibility: {
    showPositions: boolean;
    showBalances: boolean;
    showActivity: boolean;
    showBrokerName: boolean;
  };
}

export function BrokerSettingsForm({ connectionId, status, initialVisibility }: Props) {
  const [showPositions, setShowPositions] = useState(initialVisibility.showPositions);
  const [showBalances, setShowBalances] = useState(initialVisibility.showBalances);
  const [showActivity, setShowActivity] = useState(initialVisibility.showActivity);
  const [showBrokerName, setShowBrokerName] = useState(initialVisibility.showBrokerName);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function saveVisibility() {
    setMessage(null);
    startTransition(async () => {
      const res = await setBrokerVisibility({
        showPositions,
        showBalances,
        showActivity,
        showBrokerName,
      });
      setMessage(res.ok ? "Visibility saved." : res.error ?? "Could not save visibility.");
    });
  }

  function onConnect() {
    setMessage(null);
    startTransition(async () => {
      const res = await connectBrokerage();
      setMessage(res.ok ? "Connection initialized." : res.error);
    });
  }

  function onRefresh() {
    if (!connectionId) return;
    setMessage(null);
    startTransition(async () => {
      const res = await refreshBrokerage({ connectionId });
      setMessage(res.ok ? "Refresh queued." : res.error ?? "Could not refresh.");
    });
  }

  function onDisconnect() {
    if (!connectionId) return;
    setMessage(null);
    startTransition(async () => {
      const res = await disconnectBrokerage({ connectionId });
      setMessage(res.ok ? "Disconnected." : res.error ?? "Could not disconnect.");
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-lg border p-4">
        <h2 className="text-base font-semibold">Connection</h2>
        <p className="text-muted-foreground text-sm">
          Read-only brokerage verification. Nothing is public until you enable visibility toggles.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill
            label={status ?? "not connected"}
            tone={status === "connected" ? "success" : status ? "warning" : "neutral"}
          />
          {connectionId ? (
            <>
              <Button variant="secondary" onClick={onRefresh} disabled={isPending}>
                Refresh now
              </Button>
              <Button variant="destructive" onClick={onDisconnect} disabled={isPending}>
                Disconnect
              </Button>
            </>
          ) : (
            <Button onClick={onConnect} disabled={isPending}>
              Connect brokerage
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <h2 className="text-base font-semibold">Public visibility</h2>
        <ToggleRow
          checked={showPositions}
          onChange={setShowPositions}
          label="Show positions"
        />
        <ToggleRow
          checked={showBalances}
          onChange={setShowBalances}
          label="Show balances"
        />
        <ToggleRow
          checked={showActivity}
          onChange={setShowActivity}
          label="Show recent activity"
        />
        <ToggleRow
          checked={showBrokerName}
          onChange={setShowBrokerName}
          label="Show broker name"
        />
        <Button variant="outline" onClick={saveVisibility} disabled={isPending}>
          Save visibility
        </Button>
      </div>

      {message ? (
        <p className="text-muted-foreground text-sm">{message}</p>
      ) : null}
    </div>
  );
}

function ToggleRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <label className="has-[:checked]:border-primary/40 has-[:checked]:bg-primary/5 flex items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors">
      <span className="font-medium">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-foreground"
      />
    </label>
  );
}
