"use client";

import dynamic from "next/dynamic";

const ExploreGrowthExperiment = dynamic(
  () =>
    import("@/components/experiments/explore-growth-experiment").then(
      (m) => m.ExploreGrowthExperiment,
    ),
  { ssr: false },
);

export function ExploreGrowthLazy() {
  return <ExploreGrowthExperiment />;
}
