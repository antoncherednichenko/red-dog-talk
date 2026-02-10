"use client";

import { useRoomData } from "@/components/providers/room-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, PhoneOff } from "lucide-react";
import { FC } from "react";

export const RoomCallControls: FC = () => {
  const { toggleMic, isMuted } = useRoomData();

  return (
    <Card className="p-3 flex flex-row items-center justify-center gap-4">
      <Button
        variant={isMuted ? "destructive" : "outline"}
        size="icon"
        className="h-12 w-12 rounded-full"
        onClick={toggleMic}
      >
        {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
      </Button>
      <Button
        variant="destructive"
        size="icon"
        className="h-12 w-12 rounded-full"
      >
        <PhoneOff className="h-6 w-6" />
      </Button>
    </Card>
  );
};
