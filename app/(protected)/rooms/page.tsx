"use client";

import { CreateRoomModal } from "@/components/create-room-modal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useToggle } from "@/lib/hooks/useToggle";
import { MessageSquarePlus } from "lucide-react";
import { FC } from "react";

const RoomsPage: FC = () => {
  const [isOpen, toggleOpen] = useToggle();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-4 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Добро пожаловать</h1>
        <p className="text-lg text-muted-foreground">
          Вступайте в существующие голосовые комнаты или создайте свою
          собственную для общения.
        </p>
      </div>

      <Dialog open={isOpen} onOpenChange={toggleOpen}>
        <DialogTrigger asChild>
          <Button size="lg" className="gap-2">
            <MessageSquarePlus className="h-5 w-5" />
            Создать комнату
          </Button>
        </DialogTrigger>
        <CreateRoomModal onClose={toggleOpen} />
      </Dialog>
    </div>
  );
};

export default RoomsPage;
