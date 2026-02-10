import { useEffect } from "react";
import { useSocket } from "./use-socket";
import { SOCKET_EVENTS } from "@/lib/constants/socket";
import { IRoomMemberDTO, TRoomMemberStatus } from "@/lib/api/rooms";

export interface RoomEventPayload {
  roomId: string;
  userId: string;
}

export interface UpdateStatusPayload extends RoomEventPayload {
  status: TRoomMemberStatus;
}

interface UseRoomEventsProps extends RoomEventPayload {
  onMemberStatusChanged?: (member: IRoomMemberDTO) => void;
}

export const useRoomEvents = ({
  roomId,
  userId,
  onMemberStatusChanged,
}: UseRoomEventsProps) => {
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !roomId || !userId) return;

    const payload: RoomEventPayload = { roomId, userId };

    socket.emit(SOCKET_EVENTS.JOIN_ROOM, payload);

    const handleStatusChange = (member: IRoomMemberDTO) => {
      onMemberStatusChanged?.(member);
    };

    socket.on(SOCKET_EVENTS.MEMBER_STATUS_CHANGED, handleStatusChange);

    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_ROOM, payload);
      socket.off(SOCKET_EVENTS.MEMBER_STATUS_CHANGED, handleStatusChange);
    };
  }, [socket, roomId]);

  const updateStatus = (status: TRoomMemberStatus) => {
    if (!socket) return;
    const payload: UpdateStatusPayload = { roomId, userId, status };
    socket.emit(SOCKET_EVENTS.UPDATE_STATUS, payload);
  };

  return {
    updateStatus,
  };
};
