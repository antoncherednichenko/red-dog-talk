"use client";

import { LeaveRoomButton } from "@/components/features/leave-room-button";
import { useRoomData } from "@/components/providers/room-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    <div className="flex flex-col h-full bg-background border rounded-xl overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">Участники</h2>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={handleCopyLink}
          >
            <UserPlus className="h-6 w-6" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <LeaveRoomButton />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 gap-2 flex flex-col">
          {members.map((member) => (
            <div
              key={member.user.id}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-sidebar-accent/10 cursor-pointer transition-colors"
            >
              <UserAvatar value={member.user.email} />
              <div className="flex flex-1 items-center gap-2 overflow-hidden">
                <span className="font-medium truncate">{member.user.name}</span>
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
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
