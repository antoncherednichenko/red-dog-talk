"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Mic, PhoneOff } from "lucide-react";
import { FC } from "react";

export const RoomCallControls: FC = () => {
  return (
    <div className="p-3 bg-background border rounded-xl flex items-center justify-center gap-4">
      <Button variant="outline" size="icon" className="h-12 w-12 rounded-full">
        <Mic className="h-6 w-6" />
      </Button>
      <Button
        variant="destructive"
        size="icon"
        className="h-12 w-12 rounded-full"
      >
        <PhoneOff className="h-6 w-6" />
      </Button>
    </div>
  );
};
