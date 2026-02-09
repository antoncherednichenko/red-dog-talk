"use server";

import { revalidateTag } from "next/cache";
import { leaveRoom } from "../api/rooms";
import { TAGS } from "../api/tags";
import { redirect } from "next/navigation";
import { PROTECTED_ROUTES } from "../constants/routes";

export const leaveRoomAction = async (roomId: string) => {
  await leaveRoom(roomId);
  revalidateTag(TAGS.Rooms, "max");
  redirect(PROTECTED_ROUTES.Rooms);
};
