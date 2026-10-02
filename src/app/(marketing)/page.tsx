import { AuthLinkCatcher } from "@/components/marketing/AuthLinkCatcher";
import { MarketingApp } from "@/components/marketing/MarketingApp";
import { DirectoryPeek } from "@/components/marketing/DirectoryPeek";
import { ProgressPeek } from "@/components/progress/ProgressPeek";
import { getDirectoryOverview, getMarqueeLinks } from "@/lib/directory/marketing";
import { getWaitlistStats } from "@/lib/waitlistCount";
import { siteConfig } from "@/lib/siteConfig";

export default async function Home() {
  // Real signup numbers, fetched server-side (the key stays on the server) and
  // cached hourly. Only surfaced once weekly signups clear the threshold — a
  // small "3 joined this week" reads worse than showing nothing at all.
  // The directory reads never throw: on a miss the courses section and the
  // marquee links are simply left out (lib/directory/marketing.ts).
  const [stats, overview, marqueeLinks] = await Promise.all([
    getWaitlistStats(),
    getDirectoryOverview(),
    getMarqueeLinks(),
  ]);
  const liveCount =
    stats && stats.weekly > siteConfig.hero.liveCountMinWeekly ? stats : null;

  return (
    <>
      <AuthLinkCatcher />
      <MarketingApp
        liveCount={liveCount}
        progressPeek={<ProgressPeek />}
        directoryPeek={<DirectoryPeek overview={overview} />}
        marqueeLinks={marqueeLinks}
      />
    </>
  );
}
