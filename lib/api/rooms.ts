import { API_ENDPOINTS } from "./apiEndpoints";
import { IProfileDTO } from "./auth";
import { serverApi } from "./serverApi";

export const ROOM_TYPE = {
  Audio: "Audio",
  Video: "Video",
} as const;

export const ROOM_MEMBER_STATUS = {
  ONLINE: "ONLINE",
  OFFLINE: "OFFLINE",
  AFK: "AFK",
} as const;

export type TRoomMemberStatus =
  (typeof ROOM_MEMBER_STATUS)[keyof typeof ROOM_MEMBER_STATUS];

export type TRoomType = (typeof ROOM_TYPE)[keyof typeof ROOM_TYPE];

export interface ICreateRoomDTO {
  name: string;
  type: TRoomType;
}

export interface IRoomListItem {
  id: string;
  name: string;
  ownerId: string;
  type: TRoomType;
}

export interface IRoomMemberDTO {
  id: string;
  roomId: string;
  userId: string;
  status: TRoomMemberStatus;
  lastSeen: string;
  joinedAt: string;
  user: IProfileDTO;
}

export interface IRoomDTO {
  createdAt: string;
  id: string;
  name: string;
  ownerId: string;
  type: TRoomType;
  updatedAt: string;
}

export const createRoom = async (body: ICreateRoomDTO) => {
  return await serverApi<IRoomDTO>(API_ENDPOINTS.Rooms, {
    method: "POST",
    body,
  });
};

export const getRooms = async () => {
  return await serverApi<IRoomListItem[]>(API_ENDPOINTS.Rooms, {
    method: "GET",
  });
};

export const getRoom = async (roomId: string) => {
  return await serverApi<IRoomDTO>(`${API_ENDPOINTS.Rooms}/${roomId}`, {
    method: "GET",
  });
};

export const getRoomMembers = async (roomId: string) => {
  return await serverApi<IRoomMemberDTO[]>(
    `${API_ENDPOINTS.Rooms}/${roomId}/members`,
    {
      method: "GET",
    },
  );
};

export const joinRoom = async (roomId: string) => {
  return await serverApi<{ id: string }>(
    `${API_ENDPOINTS.Rooms}/${roomId}/join`,
    {
      method: "POST",
    },
  );
};

export const leaveRoom = async (roomId: string) => {
  return await serverApi(`${API_ENDPOINTS.Rooms}/${roomId}/leave`, {
    method: "POST",
  });
};
