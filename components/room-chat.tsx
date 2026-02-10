import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Paperclip, Send, Smile } from "lucide-react";
import { FC } from "react";

export const RoomChat: FC = () => {
  return (
    <div className="flex flex-col h-full bg-transparent">
      <ScrollArea className="flex-1">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2 opacity-50">
          <MessageSquare className="h-12 w-12" />
          <span>Нет сообщений</span>
        </div>
      </ScrollArea>

      <div className="p-1">
        <Card className="flex flex-row items-center gap-2 px-4 py-3">
          <Input
            placeholder="Сообщение"
            className="flex-1 !bg-transparent border-0 shadow-none focus-visible:ring-0 px-0"
          />
          <div className="flex items-center gap-1 text-muted-foreground">
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <Smile className="h-5 w-5" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <Paperclip className="h-5 w-5" />
            </Button>
          </div>
          <Button size="icon" variant="ghost">
            <Send className="h-5 w-5" />
          </Button>
        </Card>
      </div>
    </div>
  );
};
