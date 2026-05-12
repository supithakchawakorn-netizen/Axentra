"use client";

import { useState } from "react";
import Link from "next/link";
import type { PublicVideoSummary } from "@/lib/data/videos";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeader } from "@/components/shared/section-header";
import { VideoCard } from "@/components/video/video-card";
import { MarketTape } from "@/components/market/market-tape";
import { HomeGrowthLazy } from "@/components/experiments/home-growth-lazy";
import { ContinueWatchingStrip } from "@/components/video/continue-watching-strip";
import { WolfpackHeroStrip } from "@/components/shared/wolfpack-hero-strip";
import {
  HOME_MARKET_CATEGORIES,
  filterVideosByCategory,
  getHomeMarketCategory,
  type MarketCategory,
} from "@/components/pages/home/market-categories";

interface HomeMobileProps {
  videos: PublicVideoSummary[];
  initialCategory: MarketCategory;
}
export function HomeMobile({ videos, initialCategory }: HomeMobileProps) {
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory>(initialCategory);
  const activeCategory = getHomeMarketCategory(selectedCategory);
  const filteredVideos = filterVideosByCategory(videos, activeCategory.key);
  return (
    <main className="yt-page-shell w-full space-y-6 px-1 py-5">
      <PageHeader
        title="Home"
        description="Mobile-first wolfpack feed. Swipe through live and video cards."
      />
      <WolfpackHeroStrip caption="Varg Packs live market feed." />
      <HomeGrowthLazy />
      <ContinueWatchingStrip
        title="Continue watching"
        subtitle="Resume from where you left off."
      />

      <section className="space-y-3">
        <ul className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1">
          {HOME_MARKET_CATEGORIES.map((category) => {
            const isActive = category.key === activeCategory.key;
            return (
              <li key={category.key} className="snap-start">
                <button
                  type="button"
                  onClick={() => setSelectedCategory(category.key)}
                  className={`inline-flex rounded-full border px-3 py-1.5 text-xs ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {category.label}
                </button>
              </li>
            );
          })}
        </ul>
        <section className="space-y-2">
          <SectionHeader title={activeCategory.description} />
          <MarketTape symbols={activeCategory.symbols} compact />
        </section>
      </section>

      <section className="space-y-3">
        <SectionHeader
          title={`${activeCategory.label} creator videos`}
          subtitle="Videos related to your selected category."
          action={
            <Link href="/explore" prefetch={false} className="text-sm text-muted-foreground">
              See all
            </Link>
          }
        />
        {filteredVideos.length === 0 ? (
          <div className="space-y-3">
            {activeCategory.examples.map((upload) => (
              <article key={upload.title} className="rounded-xl border bg-card/60 p-4">
                <p className="text-muted-foreground mb-2 text-xs uppercase tracking-wide">Example</p>
                <p className="font-medium">{upload.title}</p>
                <p className="text-muted-foreground mt-2 text-sm">{upload.category}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                className="w-[85%] min-w-[85%] snap-start"
              >
                <VideoCard video={video} prefetch={false} />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

