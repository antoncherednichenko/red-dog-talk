"use client";

import {
  createContext,
  useEffect,
  useState,
  FC,
  PropsWithChildren,
} from "react";
import { io, Socket } from "socket.io-client";

export const SocketContext = createContext<Socket | null>(null);

export const SocketProvider: FC<PropsWithChildren> = ({ children }) => {
  const [socket] = useState<Socket>(() =>
    io(process.env.NEXT_PUBLIC_BASE_URL || "", {
      transports: ["websocket"],
    }),
  );

  useEffect(() => {
    const handleConnect = () => {
      console.log("Socket connected");
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.disconnect();
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
