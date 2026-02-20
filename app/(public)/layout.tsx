import { FC, PropsWithChildren } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const PublicLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-2 sm:justify-start">
            <Link href="/" className="font-bold">
              Red Dog Talk
            </Link>
            <div className="flex items-center gap-2 sm:hidden">
              <ThemeToggle />
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <nav className="flex w-full gap-2 sm:w-auto">
              <Button asChild variant="ghost" className="w-full sm:w-auto">
                <Link href="/login">Войти</Link>
              </Button>
              <Button asChild className="w-full sm:w-auto">
                <Link href="/register">Зарегистрироваться</Link>
              </Button>
            </nav>
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
};

export default PublicLayout;
