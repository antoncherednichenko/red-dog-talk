import { joinRoom } from "@/lib/api/rooms";
import { PROTECTED_ROUTES } from "@/lib/constants/routes";
import { redirect } from "next/navigation";
import { FC } from "react";

interface IJoinRoomPageProps {
  params: Promise<{ slug: string }>;
}

const JoinRoomPage: FC<IJoinRoomPageProps> = async ({ params }) => {
  const { slug } = await params;

  let roomId: string;

  try {
    const { id } = await joinRoom(slug);
    roomId = id;
  } catch (_) {
    redirect(PROTECTED_ROUTES.Rooms);
  }

  redirect(`${PROTECTED_ROUTES.Rooms}/${roomId}`);
};

export default JoinRoomPage;
