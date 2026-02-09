import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold">
            <Link href="/">Red Dog Talk</Link>
          </div>
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-2">
              <Button asChild variant="ghost">
                <Link href="/login">Войти</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Зарегистрироваться</Link>
              </Button>
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
