import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getDashboardData } from "@/lib/data/get-dashboard-data";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { DashboardDemoWrapper } from "@/components/dashboard/dashboard-demo-wrapper";

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    return <DashboardDemoWrapper />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const data = await getDashboardData(user?.id);

  return (
    <DashboardClient
      stats={data.stats}
      todaysChallenge={data.todaysChallenge}
      userName={data.userName}
      completedChallengeIds={data.completedChallengeIds}
    />
  );
}
