import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { UserAvatar } from "@/components/user-avatar";
import { IProfileDTO } from "@/lib/api/auth";
import { logoutAction } from "@/lib/actions/logoutAction";
import { LogOut, MoreVertical, Settings } from "lucide-react";
import { FC } from "react";

interface SidebarUserMenuProps {
  profile: IProfileDTO;
}

export const SidebarUserMenu: FC<SidebarUserMenuProps> = ({ profile }) => {
  return (
    <SidebarMenuItem className="cursor-pointer">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
          >
            <UserAvatar value={profile.email} size={32} />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{profile.name}</span>
              <span className="truncate text-xs">{profile.email}</span>
            </div>
            <MoreVertical className="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          side="right"
          align="end"
          sideOffset={4}
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <UserAvatar value={profile.email} size={24} />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{profile.name}</span>
                <span className="truncate text-xs">{profile.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Settings />
            Настройки
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => logoutAction()}
          >
            <LogOut />
            Выход
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
};
