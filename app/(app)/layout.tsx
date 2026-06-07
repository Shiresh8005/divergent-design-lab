import { AppNav } from "@/components/layout/app-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getAppContext } from "@/lib/data/get-app-context";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { streak, userName } = await getAppContext();

  return (
    <div className="min-h-screen bg-[var(--background)] bg-grid">
      <AppNav streak={streak} userName={userName} />
      <div className="fixed right-4 top-4 z-[55] md:hidden">
        <ThemeToggle />
      </div>
      <main className="mx-auto max-w-lg px-4 pb-28 pt-6 md:max-w-2xl md:pb-8 md:pt-8">
        {children}
      </main>
    </div>
  );
}
