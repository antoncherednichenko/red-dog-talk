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
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_BASE_URL || "", {
      transports: ["websocket"],
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected");
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
