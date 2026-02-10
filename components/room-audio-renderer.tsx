"use client";

import { useRoomData } from "@/components/providers/room-provider";
import { FC, useEffect, useRef } from "react";

const AudioPlayer: FC<{ stream: MediaStream }> = ({ stream }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current && stream) {
      audioRef.current.srcObject = stream;
    }
  }, [stream]);

  return <audio ref={audioRef} autoPlay />;
};

export const RoomAudioRenderer: FC = () => {
  const { remoteStreams } = useRoomData();

  return (
    <>
      {remoteStreams.map(({ id, stream }) => (
        <AudioPlayer key={id} stream={stream} />
      ))}
    </>
  );
};
