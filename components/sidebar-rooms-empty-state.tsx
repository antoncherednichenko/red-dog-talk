import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";
import { FC } from "react";

interface ISidebarRoomsEmptyStateProps {
  onAction: () => void;
}

export const SidebarRoomsEmptyState: FC<ISidebarRoomsEmptyStateProps> = ({
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
      <div className="rounded-full bg-muted p-3">
        <MessageSquarePlus className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-medium">Нет комнат</h3>
        <p className="text-xs text-muted-foreground">Создайте первую комнату</p>
      </div>
      <Button size="sm" onClick={onAction} className="mt-2 w-full">
        Создать комнату
      </Button>
    </div>
  );
};
