import { AppNav } from "@/components/layout/app-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)] bg-grid">
      <AppNav />
      <div className="fixed right-4 top-4 z-[55] md:hidden">
        <ThemeToggle />
      </div>
      <main className="mx-auto max-w-lg px-4 pb-28 pt-6 md:max-w-2xl md:pb-8 md:pt-8">
        {children}
      </main>
    </div>
  );
}
