import { SocketContext } from "@/components/providers/socket-provider";
import { useContext } from "react";
import { Socket } from "socket.io-client";

export const useSocket = (): Socket | null => {
  return useContext(SocketContext);
};
