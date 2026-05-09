import "server-only";

export interface DemoComment {
  id: string;
  author: string;
  text: string;
  postedAt: string;
  likes: number;
}

const VIDEO_COMMENTS: Record<string, DemoComment[]> = {
  "demo-video-1": [
    {
      id: "c-v1-1",
      author: "TradeJournalist",
      text: "Great opening plan. SPY levels were spot on today.",
      postedAt: "2h ago",
      likes: 18,
    },
    {
      id: "c-v1-2",
      author: "RetailFlow",
      text: "Can you post your pre-market checklist template next?",
      postedAt: "1h ago",
      likes: 7,
    },
  ],
  "demo-video-2": [
    {
      id: "c-v2-1",
      author: "TapeReader99",
      text: "The breakout trap section was super useful.",
      postedAt: "4h ago",
      likes: 24,
    },
  ],
};

const ROOM_COMMENTS: Record<string, DemoComment[]> = {
  "demo-room-1": [
    {
      id: "c-r1-1",
      author: "MarketPulse",
      text: "Watching SPY reclaim VWAP. Next key area at 528.20.",
      postedAt: "12m ago",
      likes: 12,
    },
    {
      id: "c-r1-2",
      author: "FlowDesk",
      text: "QQQ relative strength is improving into the open.",
      postedAt: "8m ago",
      likes: 9,
    },
  ],
  "demo-room-2": [
    {
      id: "c-r2-1",
      author: "FlowDesk",
      text: "NVDA trend intact as long as 5m higher lows hold.",
      postedAt: "6m ago",
      likes: 10,
    },
  ],
};

const FALLBACK: DemoComment[] = [
  {
    id: "c-fallback-1",
    author: "VargPacksDemo",
    text: "Comments are enabled in demo mode for UI preview.",
    postedAt: "just now",
    likes: 3,
  },
];

export function listCommentsForVideo(videoId: string): DemoComment[] {
  return VIDEO_COMMENTS[videoId] ?? FALLBACK;
}

export function listCommentsForRoom(roomId: string): DemoComment[] {
  return ROOM_COMMENTS[roomId] ?? FALLBACK;
}
