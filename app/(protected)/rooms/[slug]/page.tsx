import { RoomChat } from "@/components/room-chat";
import { FC } from "react";

const RoomPage: FC = () => {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <RoomChat />
    </div>
  );
};

export default RoomPage;
