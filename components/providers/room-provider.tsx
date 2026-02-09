"use client";

import { IRoomDTO, IRoomMemberDTO, ROOM_MEMBER_STATUS } from "@/lib/api/rooms";
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useState,
  useCallback,
} from "react";
import { useProfileData } from "./profile-provider";
import { useRoomEvents } from "@/lib/hooks/use-room-events";
import { toast } from "sonner";

interface IRoomContext {
  room: IRoomDTO;
  members: IRoomMemberDTO[];
  roomId: string;
}

const RoomContext = createContext<IRoomContext | null>(null);

interface RoomProviderProps {
  room: IRoomDTO;
  initialMembers: IRoomMemberDTO[];
  roomId: string;
}

export const RoomProvider: FC<PropsWithChildren<RoomProviderProps>> = ({
  children,
  room,
  initialMembers,
  roomId,
}) => {
  const { profile: { id: userId } } = useProfileData()

  const [members, setMembers] = useState<IRoomMemberDTO[]>(() => initialMembers);

  const handleMemberStatusChanged = useCallback((payload: IRoomMemberDTO) => {
    if (payload.userId !== userId) {
      if (payload.status === ROOM_MEMBER_STATUS.ONLINE) {
        toast.info(`${payload.user.name} снова с нами`);
      } else if (payload.status === ROOM_MEMBER_STATUS.OFFLINE) {
        toast.info(`${payload.user.name} покинул комнату`);
      }
    }

    setMembers((prev) => {
      const exists = prev.find((m) => m.userId === payload.userId);
      if (exists) {
        return prev.map((member) =>
          member.userId === payload.userId ? payload : member
        );
      }
      return [...prev, payload];
    });
  }, [userId]);

  useRoomEvents({
    roomId,
    userId,
    onMemberStatusChanged: handleMemberStatusChanged,
  });

  return (
    <RoomContext.Provider
      value={{
        room,
        members,
        roomId,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoomData = () => {
  const context = useContext(RoomContext);

  if (!context) {
    throw new Error("useRoomData must be used within a RoomProvider");
  }

  return context;
};
