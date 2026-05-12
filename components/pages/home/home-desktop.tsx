"use client";

import { useState } from "react";
import Link from "next/link";
import type { PublicVideoSummary } from "@/lib/data/videos";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeader } from "@/components/shared/section-header";
import { MarketTape } from "@/components/market/market-tape";
import { VideoCard } from "@/components/video/video-card";
import { HomeGrowthLazy } from "@/components/experiments/home-growth-lazy";
import { WolfpackHeroStrip } from "@/components/shared/wolfpack-hero-strip";
import {
  HOME_MARKET_CATEGORIES,
  filterVideosByCategory,
  getHomeMarketCategory,
  type MarketCategory,
} from "@/components/pages/home/market-categories";

interface HomeDesktopProps {
  videos: PublicVideoSummary[];
  initialCategory: MarketCategory;
}
export function HomeDesktop({ videos, initialCategory }: HomeDesktopProps) {
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory>(initialCategory);
  const activeCategory = getHomeMarketCategory(selectedCategory);
  const filteredVideos = filterVideosByCategory(videos, activeCategory.key);
  return (
    <main className="yt-page-shell w-full space-y-8 px-1 py-6 sm:px-2">
      <PageHeader
        title="Home"
        description="Wolfpack market commentary videos and live sessions."
      />
      <WolfpackHeroStrip caption="Verified creator commentary, no noise." />
      <HomeGrowthLazy />

      <section className="space-y-4">
        <ul className="flex flex-wrap items-center gap-2">
          {HOME_MARKET_CATEGORIES.map((category) => {
            const isActive = category.key === activeCategory.key;
            return (
              <li key={category.key}>
                <button
                  type="button"
                  onClick={() => setSelectedCategory(category.key)}
                  className={`inline-flex rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary text-secondary-foreground hover:bg-accent"
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
          <MarketTape symbols={activeCategory.symbols} />
        </section>
      </section>

      <section className="space-y-4">
        <SectionHeader
          title={`${activeCategory.label} creator videos`}
          subtitle="Uploads related to the selected category."
          action={
            <Link
              href="/explore"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              See all
            </Link>
          }
        />
        {filteredVideos.length === 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {activeCategory.examples.map((upload) => (
              <article key={upload.title} className="rounded-xl border bg-card/60 p-4">
                <p className="text-muted-foreground mb-2 text-xs uppercase tracking-wide">Example</p>
                <p className="font-medium">{upload.title}</p>
                <p className="text-muted-foreground mt-2 text-sm">{upload.category}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="yt-feed-grid grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
        {filteredVideos.length === 0 ? (
          <Link
            href="/sign-in?next=/studio"
            className="text-primary inline-block text-sm hover:underline underline-offset-4"
          >
            Become a creator →
          </Link>
        ) : null}
      </section>
    </main>
  );
}

