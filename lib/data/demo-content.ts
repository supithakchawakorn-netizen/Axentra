import "server-only";

const NOW = Date.now();

export const DEMO_TICKERS = [
  { id: "demo-ticker-spy", symbol: "SPY", name: "SPDR S&P 500 ETF", exchange: "NYSEARCA", country: "US" },
  { id: "demo-ticker-qqq", symbol: "QQQ", name: "Invesco QQQ Trust", exchange: "NASDAQ", country: "US" },
  { id: "demo-ticker-nvda", symbol: "NVDA", name: "NVIDIA Corp.", exchange: "NASDAQ", country: "US" },
  { id: "demo-ticker-aapl", symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", country: "US" },
  { id: "demo-ticker-msft", symbol: "MSFT", name: "Microsoft Corp.", exchange: "NASDAQ", country: "US" },
] as const;

export const DEMO_VIDEOS = [
  {
    id: "demo-video-1",
    title: "Pre-market setup: SPY and QQQ game plan",
    description: "A sample Varg Packs video for UI preview and feed testing.",
    duration_seconds: 742,
    thumbnail_url: "https://images.unsplash.com/photo-1642543348745-5c4a9e4c2f8d?auto=format&fit=crop&w=1280&q=80",
    mux_playback_id: null,
    published_at: new Date(NOW - 1000 * 60 * 60 * 2).toISOString(),
    creator: {
      id: "demo-creator-1",
      handle: "marketpulse",
      display_name: "Market Pulse",
      avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      verified_broker: true,
    },
    tickers: ["SPY", "QQQ"],
  },
  {
    id: "demo-video-2",
    title: "NVDA momentum levels into the close",
    description: "Demo content illustrating a creator breakdown format.",
    duration_seconds: 514,
    thumbnail_url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1280&q=80",
    mux_playback_id: null,
    published_at: new Date(NOW - 1000 * 60 * 60 * 5).toISOString(),
    creator: {
      id: "demo-creator-2",
      handle: "flowdesk",
      display_name: "Flow Desk",
      avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      verified_broker: false,
    },
    tickers: ["NVDA"],
  },
  {
    id: "demo-video-3",
    title: "AAPL vs MSFT relative strength recap",
    description: "Sample post-market recap format for channel profile and watch page.",
    duration_seconds: 938,
    thumbnail_url: "https://images.unsplash.com/photo-1559526324-593bc073d938?auto=format&fit=crop&w=1280&q=80",
    mux_playback_id: null,
    published_at: new Date(NOW - 1000 * 60 * 60 * 10).toISOString(),
    creator: {
      id: "demo-creator-1",
      handle: "marketpulse",
      display_name: "Market Pulse",
      avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      verified_broker: true,
    },
    tickers: ["AAPL", "MSFT"],
  },
  {
    id: "demo-video-4",
    title: "SPY midday structure and invalidation map",
    description: "Demo intraday structure update for home/explore variety.",
    duration_seconds: 676,
    thumbnail_url: "https://images.unsplash.com/photo-1642052502238-0f6f3fdf8f4f?auto=format&fit=crop&w=1280&q=80",
    mux_playback_id: null,
    published_at: new Date(NOW - 1000 * 60 * 60 * 16).toISOString(),
    creator: {
      id: "demo-creator-3",
      handle: "openrange",
      display_name: "Open Range",
      avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
      verified_broker: false,
    },
    tickers: ["SPY"],
  },
  {
    id: "demo-video-5",
    title: "QQQ close prep: scenarios into final hour",
    description: "Scenario-based close prep example for feed depth.",
    duration_seconds: 801,
    thumbnail_url: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?auto=format&fit=crop&w=1280&q=80",
    mux_playback_id: null,
    published_at: new Date(NOW - 1000 * 60 * 60 * 21).toISOString(),
    creator: {
      id: "demo-creator-2",
      handle: "flowdesk",
      display_name: "Flow Desk",
      avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      verified_broker: false,
    },
    tickers: ["QQQ"],
  },
] as const;

export const DEMO_LIVE_ROOMS = [
  {
    id: "demo-room-1",
    title: "Opening bell watchlist",
    description: "Demo live room for UX preview.",
    status: "live",
    livekit_room_name: "demo-opening-bell",
    scheduled_at: null,
    started_at: new Date(NOW - 1000 * 60 * 18).toISOString(),
    ended_at: null,
    viewer_count: 128,
    recording_video_id: null,
    creator: DEMO_VIDEOS[0].creator,
    tickers: ["SPY", "QQQ"],
  },
  {
    id: "demo-room-2",
    title: "NVDA intraday tape read",
    description: "Demo live stream for layout testing.",
    status: "live",
    livekit_room_name: "demo-nvda-tape",
    scheduled_at: null,
    started_at: new Date(NOW - 1000 * 60 * 9).toISOString(),
    ended_at: null,
    viewer_count: 74,
    recording_video_id: null,
    creator: DEMO_VIDEOS[1].creator,
    tickers: ["NVDA"],
  },
  {
    id: "demo-room-3",
    title: "Power hour setup: index and mega-cap focus",
    description: "Demo stream card to enrich live directory examples.",
    status: "live",
    livekit_room_name: "demo-power-hour",
    scheduled_at: null,
    started_at: new Date(NOW - 1000 * 60 * 5).toISOString(),
    ended_at: null,
    viewer_count: 51,
    recording_video_id: null,
    creator: DEMO_VIDEOS[3].creator,
    tickers: ["SPY", "AAPL"],
  },
] as const;

export function listDemoVideos(limit: number) {
  return DEMO_VIDEOS.slice(0, limit);
}

export function listDemoLiveRooms() {
  return DEMO_LIVE_ROOMS;
}

export function getDemoVideo(id: string) {
  return DEMO_VIDEOS.find((video) => video.id === id) ?? null;
}

export function getDemoRoom(id: string) {
  return DEMO_LIVE_ROOMS.find((room) => room.id === id) ?? null;
}

export function getDemoTickerBySymbol(symbol: string) {
  return DEMO_TICKERS.find((ticker) => ticker.symbol === symbol.toUpperCase()) ?? null;
}

export function listDemoTopTickers(limit: number) {
  return DEMO_TICKERS.slice(0, limit);
}

export function listDemoVideosForTicker(symbol: string) {
  const normalized = symbol.toUpperCase();
  return DEMO_VIDEOS.filter((video) =>
    (video.tickers as readonly string[]).includes(normalized),
  );
}

export function listDemoLiveRoomsForTicker(symbol: string) {
  const normalized = symbol.toUpperCase();
  return DEMO_LIVE_ROOMS.filter((room) =>
    (room.tickers as readonly string[]).includes(normalized),
  );
}
