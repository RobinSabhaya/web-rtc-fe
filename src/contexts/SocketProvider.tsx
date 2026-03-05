import { type ReactNode } from "react";
import { useSocket } from "../hooks/useSocket";
import { SocketContext } from "./socket.context";

type SocketProviderProps = {
  children: ReactNode;
};

const SocketProvider = ({ children }: SocketProviderProps) => {
  const { socketRef } = useSocket();

  return (
    <SocketContext.Provider value={socketRef}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
