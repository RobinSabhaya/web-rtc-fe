import io from "socket.io-client";

export const socketInit = () => {
  const socket = io(import.meta.env.VITE_SOCKET_URL as string);

  return socket;
};
