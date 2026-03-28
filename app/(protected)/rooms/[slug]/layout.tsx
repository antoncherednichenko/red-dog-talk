import { RoomCallControls } from "@/components/room-call-controls";
import { RoomParticipantsList } from "@/components/room-participants-list";
import { RoomProvider } from "@/components/providers/room-provider";
import { getRoom, getRoomMembers } from "@/lib/api/rooms";
import { FC, PropsWithChildren } from "react";

interface IRoomLayoutProps {
  params: Promise<{ slug: string }>;
}

const RoomLayout: FC<PropsWithChildren<IRoomLayoutProps>> = async ({
  children,
  params,
}) => {
  const { slug } = await params;
  const [room, members] = await Promise.all([
    getRoom(slug),
    getRoomMembers(slug),
  ]);

  return (
    <RoomProvider room={room} roomId={slug} initialMembers={members}>
      <div className="flex h-full min-h-0 flex-1 gap-2 overflow-hidden pt-4">
        <div className="flex w-80 shrink-0 min-h-0 flex-col gap-2 overflow-hidden">
          <div className="min-h-0 flex-1">
            <RoomParticipantsList />
          </div>
          <div className="shrink-0">
            <RoomCallControls />
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </RoomProvider>
  );
};

export default RoomLayout;
