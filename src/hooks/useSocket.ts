import { useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";
import { socketInit } from "../lib/socket";

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = socketInit();

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return {
    socketRef,
  };
};
