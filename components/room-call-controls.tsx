"use client";

import { useRoomData } from "@/components/providers/room-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getRoomCallToken } from "@/lib/api/rooms";
import { PROTECTED_ROUTES } from "@/lib/constants/routes";
import { RemoteTrack, Room, RoomEvent, Track } from "livekit-client";
import { Mic, MicOff, PhoneOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const controlButtonClassName = "h-12 w-12 rounded-full transition-none";

const micButtonClassName =
  "border border-border/80 bg-background text-foreground shadow-[0_2px_8px_rgba(15,23,42,0.08)] hover:bg-muted/60 hover:text-foreground";

const alertButtonClassName =
  "border border-transparent bg-rose-100 text-rose-500 shadow-none hover:bg-rose-200 hover:text-rose-500";

export const RoomCallControls: FC = () => {
  const { roomId } = useRoomData();
  const router = useRouter();
  const audioContainerRef = useRef<HTMLDivElement>(null);
  const [callRoom, setCallRoom] = useState<Room | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let connectedRoom: Room | null = null;
    const audioContainer = audioContainerRef.current;

    const attachAudioTrack = (track: RemoteTrack) => {
      if (track.kind !== Track.Kind.Audio || !audioContainer) {
        return;
      }

      const element = track.attach();
      element.autoplay = true;
      element.className = "hidden";
      audioContainer.appendChild(element);
    };

    const detachAudioTrack = (track: RemoteTrack) => {
      if (track.kind !== Track.Kind.Audio) {
        return;
      }

      track.detach().forEach((element) => element.remove());
    };

    const connectToCall = async () => {
      try {
        setIsConnecting(true);
        const { token, url } = await getRoomCallToken(roomId);

        const nextRoom = new Room({
          adaptiveStream: true,
          dynacast: true,
        });

        nextRoom.on(RoomEvent.TrackSubscribed, attachAudioTrack);
        nextRoom.on(RoomEvent.TrackUnsubscribed, detachAudioTrack);
        nextRoom.on(RoomEvent.Disconnected, () => {
          if (!isMounted) {
            return;
          }

          setCallRoom(null);
          setIsMicEnabled(false);
          setIsDisconnecting(false);
        });

        await nextRoom.connect(url, token);
        await nextRoom.localParticipant.setMicrophoneEnabled(true);

        nextRoom.remoteParticipants.forEach((participant) => {
          participant.trackPublications.forEach((publication) => {
            if (
              publication.track &&
              publication.track.kind === Track.Kind.Audio
            ) {
              attachAudioTrack(publication.track);
            }
          });
        });

        if (!isMounted) {
          nextRoom.disconnect();
          return;
        }

        connectedRoom = nextRoom;
        setCallRoom(nextRoom);
        setIsMicEnabled(true);
      } catch (error) {
        console.error("Failed to connect to LiveKit call", error);
        toast.error("Не удалось подключиться к звонку");
      } finally {
        if (isMounted) {
          setIsConnecting(false);
        }
      }
    };

    void connectToCall();

    return () => {
      isMounted = false;
      connectedRoom?.disconnect();
      audioContainer?.replaceChildren();
    };
  }, [roomId]);

  const handleToggleMicrophone = async () => {
    if (!callRoom) {
      return;
    }

    const nextValue = !isMicEnabled;

    try {
      await callRoom.localParticipant.setMicrophoneEnabled(nextValue);
      setIsMicEnabled(nextValue);
    } catch (error) {
      console.error("Failed to toggle microphone", error);
      toast.error("Не удалось переключить микрофон");
    }
  };

  const handleDisconnectCall = () => {
    setIsDisconnecting(true);
    callRoom?.disconnect();
    router.push(PROTECTED_ROUTES.Rooms);
  };

  return (
    <Card
      size="sm"
      className="border-border/80 bg-card/95 px-5 py-3 shadow-[0_14px_36px_rgba(15,23,42,0.06)]"
    >
      <div className="flex items-center justify-center gap-4">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className={`${controlButtonClassName} ${isMicEnabled ? micButtonClassName : alertButtonClassName}`}
          onClick={handleToggleMicrophone}
          disabled={isConnecting || isDisconnecting || !callRoom}
          aria-label={isMicEnabled ? "Выключить микрофон" : "Включить микрофон"}
          aria-pressed={!isMicEnabled}
        >
          {isMicEnabled ? (
            <Mic className="size-4" />
          ) : (
            <MicOff className="size-4" />
          )}
        </Button>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          className={`${controlButtonClassName} ${alertButtonClassName}`}
          onClick={handleDisconnectCall}
          disabled={isDisconnecting}
          aria-label="Отключиться от звонка"
        >
          <PhoneOff className="size-4" />
        </Button>
      </div>

      <div className="sr-only" aria-live="polite">
        {isConnecting
          ? "Подключение к звонку"
          : callRoom
            ? "Вы в звонке"
            : "Нет подключения к звонку"}
      </div>

      <div ref={audioContainerRef} className="hidden" aria-hidden="true" />
    </Card>
  );
};
