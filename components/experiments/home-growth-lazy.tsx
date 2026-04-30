"use client";

import dynamic from "next/dynamic";

const HomeGrowthExperiment = dynamic(
  () =>
    import("@/components/experiments/home-growth-experiment").then(
      (m) => m.HomeGrowthExperiment,
    ),
  { ssr: false },
);

export function HomeGrowthLazy() {
  return <HomeGrowthExperiment />;
}
