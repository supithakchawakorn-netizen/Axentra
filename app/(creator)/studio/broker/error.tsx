"use client";

export default function BrokerError() {
  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-destructive text-sm">
        Broker settings failed to load. Please refresh and try again.
      </p>
    </div>
  );
}
