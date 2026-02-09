"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { leaveRoomAction } from "@/lib/actions/leaveRoomAction";
import { LogOut } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { FC, useState } from "react";

export const LeaveRoomButton: FC = () => {
  const { slug } = useParams();
  const [isOpen, setIsOpen] = useState(false);

  const handleLeaveRoom = () => {
    leaveRoomAction(slug as string);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem
          variant="destructive"
          onSelect={(e) => e.preventDefault()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Покинуть комнату</span>
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <LogOut />
          </AlertDialogMedia>
          <AlertDialogTitle>Выйти из комнаты?</AlertDialogTitle>
          <AlertDialogDescription>
            Вы действительно хотите покинуть эту комнату? Вы сможете вернуться
            позже, если у вас есть ссылка.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline">Отменить</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleLeaveRoom}>
            Выйти
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
