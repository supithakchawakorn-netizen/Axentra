import { listLiveRooms } from "@/lib/data/live-rooms";
import { APP_NAME } from "@/lib/utils/site";
import { ExperimentQualitySignal } from "@/components/experiments/experiment-quality-signal";
import { PageViewEvent } from "@/components/analytics/page-view-event";
import { Events } from "@/lib/posthog/events";
import { LiveMobile } from "@/components/pages/live/live-mobile";
import { LiveDesktop } from "@/components/pages/live/live-desktop";
import { MobileDesktopSwitch } from "@/components/layout/mobile-desktop-switch";

export const revalidate = 30;

export const metadata = {
  title: "Live now",
  description: `Creators streaming on ${APP_NAME} right now.`,
};

export default async function LivePage() {
  const rooms = await listLiveRooms();

  return (
    <>
      <PageViewEvent
        event={Events.LiveDirectoryView}
        properties={{ room_count: rooms.length }}
      />
      <ExperimentQualitySignal signal="route_continuation" path="/live" />
      <MobileDesktopSwitch mobile={<LiveMobile rooms={rooms} />} desktop={<LiveDesktop rooms={rooms} />} />
    </>
  );
}
