import { createContext, useContext, type RefObject } from "react";
import type { Socket } from "socket.io-client";

export const SocketContext = createContext<RefObject<Socket | null> | null>(
  null,
);

export const useSocketContext = (): RefObject<Socket | null> => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocketContext must be used inside SocketProvider");
  }

  return context;
};
