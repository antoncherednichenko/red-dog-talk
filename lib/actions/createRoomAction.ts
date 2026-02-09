"use server";

import { revalidateTag } from "next/cache";
import { createRoom, ICreateRoomDTO } from "../api/rooms";
import { TAGS } from "../api/tags";

export const createRoomAction = async (body: ICreateRoomDTO) => {
  await createRoom(body);
  revalidateTag(TAGS.Rooms, "max");
};
