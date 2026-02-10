import { RoomAudioRenderer } from "@/components/room-audio-renderer";
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
      <div className="flex h-full gap-2 pt-4">
        <div className="flex w-80 flex-col gap-2 shrink-0">
          <div className="flex-1">
            <RoomParticipantsList />
          </div>
          <div className="shrink-0">
            <RoomCallControls />
          </div>
        </div>
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 shrink-0">
            <h2 className="text-lg font-semibold">{room.name}</h2>
          </div>
          <RoomAudioRenderer />
          <div className="flex-1 min-h-0">{children}</div>
        </div>
      </div>
    </RoomProvider>
  );
};

export default RoomLayout;
