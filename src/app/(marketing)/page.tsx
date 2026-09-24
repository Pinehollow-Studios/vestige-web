import { MarketingApp } from "@/components/marketing/MarketingApp";
import { ProgressPeek } from "@/components/progress/ProgressPeek";
import { getWaitlistStats } from "@/lib/waitlistCount";
import { siteConfig } from "@/lib/siteConfig";

export default async function Home() {
  // Real signup numbers, fetched server-side (the key stays on the server) and
  // cached hourly. Only surfaced once weekly signups clear the threshold — a
  // small "3 joined this week" reads worse than showing nothing at all.
  const stats = await getWaitlistStats();
  const liveCount =
    stats && stats.weekly > siteConfig.hero.liveCountMinWeekly ? stats : null;

  return <MarketingApp liveCount={liveCount} progressPeek={<ProgressPeek />} />;
}
