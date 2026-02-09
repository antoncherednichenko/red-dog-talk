"use client";
import { CreateRoomModal } from "@/components/create-room-modal";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { IProfileDTO } from "@/lib/api/auth";
import { IRoomListItem, ROOM_TYPE } from "@/lib/api/rooms";
import { PROTECTED_ROUTES } from "@/lib/constants/routes";
import { useToggle } from "@/lib/hooks/useToggle";
import {
  ChevronsUpDown,
  LogOut,
  MessageSquare,
  Mic,
  Plus,
  Search,
  Settings,
  Video,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FC, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { UserAvatar } from "./user-avatar";
import { SidebarUserMenu } from "./features/sidebar-user-menu";

interface ISideBarProps {
  profile: IProfileDTO;
  rooms: IRoomListItem[];
}

export const AppSidebar: FC<ISideBarProps> = ({ profile, rooms }) => {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, toggleOpen] = useToggle();

  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link
              href={PROTECTED_ROUTES.Rooms}
              className="flex items-center gap-2 px-2 py-1 font-semibold"
            >
              <span className="">Red dog talk</span>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="px-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по названию"
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Комнаты</SidebarGroupLabel>
          <Dialog open={isOpen} onOpenChange={toggleOpen}>
            <DialogTrigger asChild>
              <SidebarGroupAction title="Создать комнату">
                <Plus /> <span className="sr-only">Add Room</span>
              </SidebarGroupAction>
            </DialogTrigger>
            <CreateRoomModal onClose={toggleOpen} />
          </Dialog>

          <SidebarGroupContent className="mt-2">
            <SidebarMenu>
              {filteredRooms.map((room) => {
                const roomPath = `${PROTECTED_ROUTES.Rooms}/${room.id}`;
                return (
                  <SidebarMenuItem key={room.id}>
                    <SidebarMenuButton asChild isActive={pathname === roomPath}>
                      <Link href={roomPath}>
                        {room.type === ROOM_TYPE.Audio ? <Mic /> : <Video />}
                        <span>{room.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarUserMenu profile={profile} />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
