"use client";

import { LeaveRoomButton } from "@/components/features/leave-room-button";
import { useRoomData } from "@/components/providers/room-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserAvatar } from "@/components/user-avatar";
import { ROOM_MEMBER_STATUS } from "@/lib/api/rooms";
import { Settings, UserPlus } from "lucide-react";
import { FC } from "react";
import { toast } from "sonner";

export const RoomParticipantsList: FC = () => {
  const { members, roomId } = useRoomData();

  const handleCopyLink = () => {
    const link = `${window.location.origin}/join/${roomId}`;
    navigator.clipboard.writeText(link);
    toast.success("Ссылка скопирована");
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b space-y-0">
        <CardTitle className="text-lg font-semibold">Участники</CardTitle>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={handleCopyLink}
          >
            <UserPlus className="h-6 w-6" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <LeaveRoomButton />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 min-h-0">
        <ScrollArea className="h-full">
          <SidebarMenu className="p-2 gap-2">
            {members.map((member) => (
              <SidebarMenuItem key={member.user.id}>
                <SidebarMenuButton className="h-auto px-2 py-1.5 gap-3" asChild>
                  <div className="cursor-pointer">
                    <UserAvatar value={member.user.email} />
                    <div className="flex flex-1 items-center gap-2 overflow-hidden">
                      <span className="font-medium truncate">
                        {member.user.name}
                      </span>
                      <Badge
                        variant={
                          member.status === ROOM_MEMBER_STATUS.ONLINE
                            ? "default"
                            : "destructive"
                        }
                        className={
                          member.status === ROOM_MEMBER_STATUS.ONLINE
                            ? "bg-green-500/15 text-green-700 hover:bg-green-500/25 border-transparent"
                            : ""
                        }
                      >
                        {member.status === ROOM_MEMBER_STATUS.ONLINE
                          ? "online"
                          : "offline"}
                      </Badge>
                    </div>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
