import { AppSidebar } from "@/components/app-sidebar";
import { ProfileProvider } from "@/components/providers/profile-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { UserAvatar } from "@/components/user-avatar";
import { getProfile } from "@/lib/api/auth";
import { getRooms } from "@/lib/api/rooms";
import { FC, PropsWithChildren } from "react";

export const dynamic = "force-dynamic";

const ProtectedLayout: FC<PropsWithChildren> = async ({ children }) => {
  const [profile, rooms] = await Promise.all([getProfile(), getRooms()]);

  return (
    <ProfileProvider profile={profile}>
      <SidebarProvider>
        <AppSidebar profile={profile} rooms={rooms} />
        <SidebarInset>
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
              <UserAvatar value={profile.email} size={32} />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-background">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProfileProvider>
  );
};

export default ProtectedLayout;
